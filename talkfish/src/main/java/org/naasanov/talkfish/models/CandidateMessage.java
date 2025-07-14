package org.naasanov.talkfish.models;

import java.util.Map;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.messages.UserMessage;

public class CandidateMessage extends UserMessage {
  private final String text;

  public CandidateMessage(String textContent) {
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
    return "[CANDIDATE] " + text;
  }

  @Override
  public Map<String, Object> getMetadata() {
    return Map.of("role", "candidate");
  }
}
