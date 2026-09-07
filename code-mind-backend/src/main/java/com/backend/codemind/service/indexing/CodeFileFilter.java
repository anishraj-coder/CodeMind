package com.backend.codemind.service.indexing;

import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;

@Service
public class CodeFileFilter {

    private static final Set<String> SKIP_DIR_PARTS = Set.of(
            "node_modules", ".git", "dist", "build", "target", ".next", "vendor",
            "__pycache__", ".idea", ".vscode", "coverage", "out", ".svn", ".hg",
            ".bzr", ".gradle", ".m2", ".mvn", ".cargo", ".rustup", ".venv", "venv",
            "env", "ENV", ".pytest_cache", ".mypy_cache", ".ruff_cache", ".tox",
            ".cache", ".angular", ".svelte-kit", ".nuxt", ".turbo", "bin", "obj",
            ".ds_store", ".idea_modules", ".settings", ".classpath", ".project",
            "tmp", "temp", "logs", "public/build", "site", "javadoc", ".terraform",
            ".serverless", "bower_components", "deps", "_build", ".elixir_ls",
            ".gotest", ".go", "vendor/bundle", ".bundle", "pods", "deriveddata",
            ".swiftpm", ".dart_tool", ".pub-cache", "android/.gradle", "ios/Pods",
            "release", "debug", "packages", ".yarn", ".pnp", ".cache-loader",
            ".parcel-cache", "dist-ssr", ".output", ".vercel", ".netlify",
            ".aws-sam", ".chalice", ".cdk.out", "target/ink", "artifacts",
            "typechain", "cache"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "java", "kt", "kts", "scala", "ts", "tsx", "js", "jsx", "mjs", "cjs",
            "py", "go", "rs", "rb", "php", "c", "h", "cpp", "hpp", "cs", "swift",
            "m", "mm", "md", "mdx", "txt", "yml", "yaml", "json", "toml", "xml",
            "properties", "gradle", "sql", "sh", "bash", "zsh", "dockerfile",
            "makefile", "html", "css", "scss", "sass", "vue", "svelte", "groovy",
            "clj", "cljs", "ex", "exs", "erl", "hs", "lhs", "dart", "lua", "r",
            "rmd", "jl", "pl", "pm", "proto", "graphql", "gql", "env", "ini",
            "conf", "cfg", "log", "rst", "adoc", "json5", "jsonc", "csv", "tsv",
            "ps1", "bat", "cmd", "fish", "pks", "pkb", "sol", "tf", "tfvars",
            "hcl", "astro", "elm", "f90", "f95", "pas", "zig", "nim"
    );

    private static final Set<String> SKIP_FILENAMES = Set.of(
            "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "composer.lock",
            "cargo.lock", "poetry.lock", "gemfile.lock", "mix.lock", "pubspec.lock",
            "flake.lock", "go.sum", "npm-shrinkwrap.json", "bun.lockb",
            ".ds_store", "thumbs.db", "desktop.ini",
            ".env", ".env.local", ".env.development", ".env.production", ".env.test"
    );
    public boolean isEligible(String path, Long sizeBytes, Long maxFileBytes) {
        if (path == null || path.isBlank()) return false;
        if (sizeBytes != null && sizeBytes > maxFileBytes) return false;

        String normalized = path.replace("\\", "/");
        String lower = normalized.toLowerCase(Locale.ROOT);

        for (String part : lower.split("/")) {
            if (SKIP_DIR_PARTS.contains(part)) return false;
        }

        String fileName = lower.substring(lower.lastIndexOf("/") + 1);
        if (fileName.startsWith(".") || SKIP_FILENAMES.contains(fileName)) return false;

        if ("dockerfile".equals(fileName) || "makefile".equals(fileName)) return true;

        int dotIdx = lower.lastIndexOf(".");
        if (dotIdx < 0) return false;
        String ext = lower.substring(dotIdx + 1);
        return ALLOWED_EXTENSIONS.contains(ext);
    }

    public String detectLanguage(String path) {
        String normalized = path.replace("\\", "/");
        String fileName = normalized.substring(normalized.lastIndexOf("/") + 1);
        if ("dockerfile".equalsIgnoreCase(fileName)) return "docker";
        if ("makefile".equalsIgnoreCase(fileName)) return "makefile";
        int dotIdx = fileName.lastIndexOf(".");
        if (dotIdx < 0) return "text";
        return fileName.substring(dotIdx + 1);
    }
}