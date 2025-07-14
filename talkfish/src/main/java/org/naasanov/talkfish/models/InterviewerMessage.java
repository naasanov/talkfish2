package org.naasanov.talkfish.models;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.messages.UserMessage;

import java.util.Map;

public class InterviewerMessage extends UserMessage {
  private final String text;

  public InterviewerMessage(String textContent) {
    super(textContent);
    this.text = textContent;
  }

  @Override
  @NonNull
  public MessageType getMessageType() {
    return MessageType.USER;
  }

  @Override
  public String getText() {
    return "[INTERVIEWER] " + text;
  }

  @Override
  public Map<String, Object> getMetadata() {
    return Map.of("role", "interviewer");
  }
}
