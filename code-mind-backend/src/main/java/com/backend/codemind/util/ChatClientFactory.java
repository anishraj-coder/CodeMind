package com.backend.codemind.util;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ChatClientFactory {

    private final OllamaChatModel ollamaChatModel;
    private final GoogleGenAiChatModel geminiChatModel;
    private final Map<String, ChatClient.Builder> clients = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        clients.putIfAbsent("gemini", ChatClient.builder(geminiChatModel));
        clients.putIfAbsent("ollama", ChatClient.builder(ollamaChatModel));
    }

    public ChatClient.Builder getChatClient(String clientName) {
        if (clientName == null) {
            return this.clients.get("gemini");
        }
        return clients.getOrDefault(clientName.toLowerCase(), clients.get("gemini"));
    }
}