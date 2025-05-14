package org.naasanov.talkfish;

import lombok.RequiredArgsConstructor;
import org.naasanov.talkfish.handlers.FeedbackHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
  private final FeedbackHandler feedbackHandler;

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry
        .addHandler(feedbackHandler, "/ws/feedback")
        .setAllowedOrigins("*"); // Adjust for production
  }
}
