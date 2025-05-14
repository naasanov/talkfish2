package org.naasanov.talkfish.controllers;

import org.naasanov.talkfish.dtos.GreetingDto;
import org.naasanov.talkfish.dtos.HelloMessageDto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
public class GreetingController {
  @MessageMapping("/hello")
  @SendTo("/topic/greetings")
  public GreetingDto sendGreeting(HelloMessageDto message) throws InterruptedException {
    Thread.sleep(1000);
    GreetingDto greeting = new GreetingDto();
    greeting.setContent("Hello, " + HtmlUtils.htmlEscape(message.getName()) + "!");
    return greeting;
  }
}
