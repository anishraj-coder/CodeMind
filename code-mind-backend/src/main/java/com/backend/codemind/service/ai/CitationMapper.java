package com.backend.codemind.service.ai;

import com.backend.codemind.dto.CitationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor
public class CitationMapper {

    private final JsonMapper jsonMapper;

    public CitationDto fromDocument(Document document) {
        var meta = document.getMetadata();
        return CitationDto.builder()
                .filePath(stringVal(meta.get(RagSettings.FILE_PATH)))
                .startLine(intVal(meta.get(RagSettings.START_LINE)))
                .endLine(intVal(meta.get(RagSettings.END_LINE)))
                .language(stringVal(meta.get(RagSettings.LANGUAGE)))
                .build();
    }

    public String toJson(List<CitationDto> citationDTO) {
        try {
            return jsonMapper.writeValueAsString(citationDTO);
        } catch (JacksonException ex) {
            log.warn("[CITATION_MAPPER]: Error converting to Json value: {}", ex.getMessage());
            return "[]";
        }
    }

    public List<CitationDto> fromJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return jsonMapper.readValue(json, new TypeReference<List<CitationDto>>() {
            });
        } catch (JacksonException ex) {
            log.warn("[CITATION_MAPPER]: Error converting from Json to class value: {}", ex.getMessage());
            return List.of();
        }
    }

    private String stringVal(Object obj) {
        return obj == null ? null : String.valueOf(obj);
    }

    private Integer intVal(Object obj) {
        if (obj instanceof Number number) {
            return number.intValue();
        }
        if (obj == null) return -1;
        try {
            return Integer.parseInt(String.valueOf(obj));
        } catch (NumberFormatException ex) {
            log.warn("[CITATION_MAPPER]: Error converting Integer value: {}", ex.getMessage());
        }
        return -1;
    }
}
