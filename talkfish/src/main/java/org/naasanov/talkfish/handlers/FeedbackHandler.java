package org.naasanov.talkfish.handlers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.NonNull;
import org.naasanov.talkfish.models.CandidateMessage;
import org.naasanov.talkfish.models.InterviewerMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatModel;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class FeedbackHandler extends TextWebSocketHandler {
  private final VertexAiGeminiChatModel chatModel;
  private final List<Message> messages;
  private final ObjectMapper objectMapper;

  public FeedbackHandler(VertexAiGeminiChatModel chatModel) {
    this.chatModel = chatModel;
    this.objectMapper = new ObjectMapper();
    this.messages = new ArrayList<>();
    this.messages.add(
        new SystemMessage(
            """
                            You are an AI coach assisting a candidate during a mock interview. Your
     role is to provide immediate, constructive feedback to the candidate's spoken answers (transcribed to text).
     You should also provide tips on how to answer each of the interviewer's questions.
     Keep your tone encouraging, concise, and actionable.\s

                            Your feedback should focus on:
                            - Clarity and structure of the answer
                            - Use of filler words (e.g. "um", "like")
                            - Repetitiveness or rambling
                            - Missing detail or lack of specificity
                            - Professional tone and delivery

                            Avoid repeating the full input. Do not summarize. Just respond with a
     short, clear suggestion (1 paragraph max) that helps the user improve their answer in real
     time.

                            Assume the user is speaking, not typing, and give advice as if you're
     a coach sitting beside them.

                            Any content that comes from the interviewer will be prepended with "[INTERVIEWER] ",
                            and any content that comes form the candidate will be prepended with "[CANDIDATE] ".

                            Any feedback you give to a candidate's spoken answers should come with a "Feedback:"
                            header, and any tips you provide after a interviewer's spoken question should come
                            with a "Tips:" header. Headers should be followed by a new line.
     """));
  }

  @Override
  public void handleTextMessage(@NonNull WebSocketSession session, TextMessage message)
      throws Exception {
    JsonNode json = objectMapper.readTree(message.getPayload());
    String role = json.get("role").asText();
    String content = json.get("content").asText();

    Message wrappedMessage = "interviewer".equalsIgnoreCase(role) 
      ? new InterviewerMessage(content) 
      : new CandidateMessage(content);

    messages.add(wrappedMessage);

    final StringBuilder assistantContent = new StringBuilder();
    System.out.println("Received message: " + wrappedMessage.getText());
    chatModel.stream(new Prompt(messages))
        .doOnNext(
            response -> {
              try {
                String responseText = response.getResult().getOutput().getText();
                session.sendMessage(new TextMessage(responseText));
                assistantContent.append(responseText);
              } catch (IOException e) {
                System.out.println("Error sending message");
                e.printStackTrace();
              }
            })
        .doOnComplete(() -> messages.add(new AssistantMessage(assistantContent.toString())))
        .subscribe();
  }
}
