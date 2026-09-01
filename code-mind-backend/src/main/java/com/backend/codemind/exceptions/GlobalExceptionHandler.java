package com.backend.codemind.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> badRequestHandler(BadRequestException ex){
        return error(HttpStatus.BAD_GATEWAY,ex.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String,Object>> resourceNotFoundHandler(NotFoundException ex){
        return error(HttpStatus.NOT_FOUND,ex.getMessage());
    }

    public ResponseEntity<Map<String,Object>> unauthorizedAccessHandler(UnauthorizedAccessException ex){
        return error(HttpStatus.UNAUTHORIZED,ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = Map.of(
                "timestamp", Instant.now(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        );
        return new ResponseEntity<>(body, status);
    }
}
