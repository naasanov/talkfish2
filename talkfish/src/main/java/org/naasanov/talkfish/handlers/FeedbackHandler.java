package org.naasanov.talkfish.handlers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

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

    Any content that comes from the interviewer will be prepended with "[INTERVIEWER]",
    and any content that comes form the candidate will be prepended with "[CANDIDATE]"

    There are three types of responses you can give. 
    
    The first is "feedback". You will respond with this type after receiving a CANDIDATE message. 
    This should be immediate, clear, constructive feedback to the candidate's spoken answers (transcribed to text).
    When giving feedback, you should also include a score 1-10 on how good the candidate's response was.
    
    The second type is "tips". You will respond with this type after receiving a INTERVIEWER message.
    This should be a short, clear suggestion (1 paragraph max) that helps the user improve their answer in real time.

    The third and last type is "NO_OP". You will respond with this type when you have no feedback or tips to give.
    For example, if the candidate and interviewer are simply exchanging pleasantries without any substantive content, 
    you can respond with "NO_OP". However, only do this if you are sure that there is no feedback or tips to give. For Example
    if they say hello, but then the interviewer asks a question, you should not respond with "NO_OP" but rather with "tips".
    
    IMPORTANT FORMATTING RULES:
    - Do NOT use markdown formatting
    - Do NOT use triple backticks (```)
    - Use ONLY plain text
    - Do NOT include any other formatting

    You must respond in structured data, defined further below

    Each response should start with <type>...</type>, to indicate the type of response.
    The type can be "feedback", "tips", or "NO_OP". If the type is "NO_OP", this is all you should include in the response.

    If the type is "feedback" or "tips", you should include a <content>...</content> tag with your response.
    Then, if the type is "feedback", you should also include a <score>...</score> tag with a score 1-10 on how good the candidate's response was.

    Example responses:
    <type>NO_OP</type>
    <type>tips</type><content>Use the STAR method...</content>
    <type>feedback</type><content>Great job on your answer! You were clear and concise, but try to avoid filler words like "um" and "like".</content><score>8</score>
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
    int responseId = messages.size() - 1;

    StringBuilder assistantContent = new StringBuilder();
    System.out.println("Received message: " + wrappedMessage.getText());
    chatModel.stream(new Prompt(messages))
        .doOnNext(
            response -> {
              try {
                String responseText = response.getResult().getOutput().getText();

                ObjectNode responseNode = objectMapper.createObjectNode();
                responseNode.put("id", responseId);
                responseNode.put("content", responseText);

                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(responseNode)));
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
