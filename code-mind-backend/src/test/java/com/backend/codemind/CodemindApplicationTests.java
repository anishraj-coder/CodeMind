package com.backend.codemind;

import com.backend.codemind.security.CurrentUser;
import com.backend.codemind.service.GitHubRepositoryService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.encrypt.TextEncryptor;

@Slf4j
@SpringBootTest
class CodemindApplicationTests {

	@Value("${app.github.access-token}")
	private String accessToken;
	@Autowired
	private GitHubRepositoryService gitHubRepositoryService;
	@Autowired
	private TextEncryptor textEncryptor;
	@Autowired
	private CurrentUser currentUser;

	@Test
	void getLastCommit() {
		log.info(">>Executing the Last commit method");

	}

}
