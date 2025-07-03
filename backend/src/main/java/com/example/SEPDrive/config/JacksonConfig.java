package com.example.SEPDrive.config;


//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.SerializationFeature;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import com.fasterxml.jackson.module.paramnames.ParameterNamesModule;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
//
//@Configuration
//public class JacksonConfig {
//
//    @Bean
//    public Jackson2ObjectMapperBuilder jacksonBuilder() {
//        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
//        builder.modules(new JavaTimeModule());
//        // disables serialization of dates as numeric timestamps
//        builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
//        return builder;
//    }
//
////    @Bean
////    public ObjectMapper objectMapper() {
////        ObjectMapper om = new ObjectMapper();
////        // make sure we have parameter-name support for records
////        om.registerModule(new ParameterNamesModule());
////        // make sure we have Java 8 date/time support
////        om.registerModule(new JavaTimeModule());
////        // output as ISO strings, not timestamps
////        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
////        return om;
////    }
//}
