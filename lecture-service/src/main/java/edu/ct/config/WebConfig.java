package edu.ct.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/completions/**")
                .allowedOrigins("https://ctlms.shop", "http://ctlms.shop")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);

        registry.addMapping("/api/lectures/**")
                .allowedOrigins("https://ctlms.shop", "http://ctlms.shop")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);

        registry.addMapping("/api/contents/**")
                .allowedOrigins("https://ctlms.shop", "http://ctlms.shop")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);

        // 필요한 API가 더 있다면 똑같이 추가
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = Paths.get("uploads").toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/files/**")
                .addResourceLocations(uploadPath);
    }
}
