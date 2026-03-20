package com.medpro.medpro.model.entity;

import com.medpro.medpro.model.dto.DadosEndereco;

import jakarta.persistence.Embeddable;

@Embeddable
public class Endereco {

    private String logradouro;
    private String bairro;
    private String cep;
    private String cidade;
    private String uf;
    private String numero;
    private String complemento;

    public Endereco() {
    }

    public Endereco(String logradouro, String bairro, String cep, String cidade, String uf, String numero,
            String complemento) {
        this.logradouro = logradouro;
        this.bairro = bairro;
        this.cep = cep;
        this.cidade = cidade;
        this.uf = uf;
        this.numero = numero;
        this.complemento = complemento;
    }

    public Endereco(DadosEndereco endereco) {
        this.logradouro = endereco.logradouro();
        this.bairro = endereco.bairro();
        this.cep = endereco.cep();
        this.cidade = endereco.cidade();
        this.uf = endereco.uf();
        this.numero = endereco.numero();
        this.complemento = endereco.complemento();
    }

    public void atualizarInformacoes(DadosEndereco dados) {
        if(dados.logradouro() != null){
            if(dados.logradouro().isBlank()){
                throw new IllegalArgumentException("Logradouro não pode ser nulo!");
            }
            else{
                this.logradouro = dados.logradouro();
            }
        }

        if(dados.bairro() != null){
            if(dados.bairro().isBlank()){
                throw new IllegalArgumentException("Bairro não pode ser nulo!");
            }
            else{
                this.bairro = dados.bairro();
            }
        }

        if(dados.cep() != null){
            if(dados.cep().isBlank()){
                throw new IllegalArgumentException("Cep não pode ser nulo!");
            }
            else{
                this.cep = dados.cep();
            }
        }

        if(dados.cidade() != null){
            if(dados.cidade().isBlank()){
                throw new IllegalArgumentException("Cidade não pode ser nulo!");
            }
            else{
                this.cidade = dados.cidade();
            }
        }

        if(dados.uf() != null){
            if(dados.uf().isBlank()){
                throw new IllegalArgumentException("UF não pode ser nulo!");
            }
            else{
                this.uf = dados.uf();
            }
        }

        if(dados.numero() != null){
                this.numero = dados.numero();
        }

        if(dados.complemento() != null){
                this.complemento = dados.complemento();
        }
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    
}