package com.example.SEPDrive.config;

import com.example.SEPDrive.model.account;
import com.example.SEPDrive.model.account.AccountType;
import com.example.SEPDrive.repository.accountDAO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebsiteWalletConfig {

    @Bean
    public CommandLineRunner createSystemWallet(accountDAO accountDao) {
        return args -> {
            if (accountDao.findByType(AccountType.SEP_WALLET).isEmpty()) {
                account sepWallet = new account();
                sepWallet.setType(AccountType.SEP_WALLET);
                accountDao.save(sepWallet);
                System.out.println(" SEP_WALLET system account was created");
            } else {
                System.out.println(" SEP_WALLET already exists");
            }
        };
    }
}