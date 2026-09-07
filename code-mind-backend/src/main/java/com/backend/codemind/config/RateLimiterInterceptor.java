package com.backend.codemind.config;

import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RateLimiterInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(5).refillGreedy(1, Duration.ofSeconds(2)))
                .build();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (jakarta.servlet.DispatcherType.ASYNC.equals(request.getDispatcherType())) {
            return true;
        }
        log.info("[RATE LIMITER]: Entering into the rate limiting section for request: {}",request.getRequestURI());
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }


        WithRateLimiter withRateLimiter = handlerMethod.getMethodAnnotation(WithRateLimiter.class);
        if (withRateLimiter == null) {
            return true;
        }

        String ipAddr = getClientIp(request);
        Bucket bucket = cache.computeIfAbsent(ipAddr, k -> createNewBucket());

        if (bucket.tryConsume(1)) {
            return true;
        } else {
            log.warn("[RATE LIMITER]: Request rate limit exceeded for IP: {}", ipAddr);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
            return false;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}