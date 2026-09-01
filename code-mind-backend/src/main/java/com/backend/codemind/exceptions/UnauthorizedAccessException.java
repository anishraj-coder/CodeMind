package com.backend.codemind.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedAccessException extends RuntimeException{
    public UnauthorizedAccessException(){
        this("The access to this Resource is Unauthorized");
    }
    public UnauthorizedAccessException(String message){
        super(message);
    }
}
