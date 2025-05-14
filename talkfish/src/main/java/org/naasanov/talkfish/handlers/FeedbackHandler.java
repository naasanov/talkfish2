package org.naasanov.talkfish.handlers;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatModel;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
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

  public FeedbackHandler(VertexAiGeminiChatModel chatModel) {
    this.chatModel = chatModel;
    this.messages = new ArrayList<>();
    //    this.messages.add(
    //        new SystemMessage(
    //            """
    //                        You are an AI coach assisting a user during a mock interview. Your
    // role is to listen to the user's spoken answers (transcribed to text) and provide immediate,
    // constructive feedback. Keep your tone encouraging, concise, and actionable.\s
    //
    //                        Your feedback should focus on:
    //                        - Clarity and structure of the answer
    //                        - Use of filler words (e.g. "um", "like")
    //                        - Repetitiveness or rambling
    //                        - Missing detail or lack of specificity
    //                        - Professional tone and delivery
    //
    //                        Avoid repeating the full input. Do not summarize. Just respond with a
    // short, clear suggestion (1–2 sentences max) that helps the user improve their answer in real
    // time.
    //
    //                        Assume the user is speaking, not typing, and give advice as if you're
    // a coach sitting beside them.
    //                        """));
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    System.out.println("Connected to feedback");
  }

  @Override
  public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    String payload = message.getPayload();

    messages.add(new UserMessage(payload));

    final StringBuilder assistantContent = new StringBuilder();
    System.out.println("Received message: " + payload);
    chatModel.stream(new Prompt(messages))
        .doOnNext(
            response -> {
              try {
                String responseText = response.getResult().getOutput().getText();
                session.sendMessage(new TextMessage(responseText));
                assistantContent.append(response);
              } catch (IOException e) {
                System.out.println("Error sending message");
                e.printStackTrace();
              }
            })
        .doOnComplete(() -> messages.add(new AssistantMessage(assistantContent.toString())))
        .subscribe();
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    System.out.println("Connection closed");
  }
}
