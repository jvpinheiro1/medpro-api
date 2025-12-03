# MedPro - Sistema de Gestão de Clínica Médica

Sistema desenvolvido como Atividade Avaliativa para gestão de clínicas, permitindo o cadastro de médicos, pacientes e o agendamento de consultas.

## 🚀 Tecnologias Utilizadas

* **Backend:** Java 21, Spring Boot 3
* **Banco de Dados:** MySQL
* **Gerenciamento de Migrations:** Flyway
* **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript (Vanilla)

---

## 🛠️ Tutorial de Inicialização

Siga os passos abaixo na ordem para configurar e rodar o projeto.

### 1. Configuração do Banco de Dados (MySQL via CMD)

O projeto utiliza o MySQL. Conforme solicitado, configuraremos as variáveis de ambiente para gerenciá-lo pelo CMD.

#### Passo 1.1: Adicionar o MySQL ao PATH (Windows)
Se o comando `mysql` não for reconhecido no seu terminal, siga estes passos:

1.  Pesquise no Windows por **"Editar as variáveis de ambiente do sistema"**.
2.  Clique no botão **Variáveis de Ambiente**.
3.  Na seção **Variáveis do sistema** (parte de baixo), procure a variável `Path` e clique em **Editar**.
4.  Clique em **Novo** e adicione o caminho da pasta `bin` da sua instalação do MySQL.
    * *Exemplo comum:* `C:\Program Files\MySQL\MySQL Server 8.0\bin`
5.  Clique em OK em todas as janelas.
6.  Feche e abra novamente o seu CMD.

#### Passo 1.2: Criar o Banco de Dados
1.  Abra o CMD (Prompt de Comando).
2.  Acesse o MySQL com o seu usuário (geralmente root):
    ```cmd
    mysql -u root -p
    ```
3.  Digite sua senha do MySQL quando solicitado.
4.  Crie o banco de dados com o comando abaixo:
    ```sql
    CREATE DATABASE medpro_api;
    ```
5.  Digite `exit` para sair.

> **Nota:** O projeto está configurado no arquivo `application.properties` para usar:
> * **Usuário:** root
> * **Senha:** aluno
> * **Banco:** medpro_api
>
> Caso sua senha local seja diferente, altere o arquivo `medpro/src/main/resources/application.properties`.

---

### 2. Inicialização do Backend (Spring Boot)

O projeto utiliza o Maven Wrapper, então você não precisa ter o Maven instalado globalmente, apenas o Java 21.

1.  Abra o terminal na pasta `medpro` (onde está o arquivo `pom.xml`).
2.  Execute o comando para baixar as dependências e subir a aplicação:

    **No Windows (CMD/PowerShell):**
    ```cmd
    ./mvnw.cmd spring-boot:run
    ```

    **No Linux/Mac:**
    ```bash
    ./mvnw spring-boot:run
    ```

3.  Aguarde a inicialização. O **Flyway** irá criar automaticamente as tabelas (`medicos`, `pacientes`, `consultas`) executando as migrations (V1 a V6).
4.  O backend estará rodando em: `http://localhost:8080`.

---

### 3. Inicialização do Frontend

O frontend é uma aplicação simples em HTML/JS localizada na pasta `front`.

1.  Navegue até a pasta `front`.
2.  Você pode abrir o arquivo `index.html` diretamente no navegador (clique duplo).
3.  **Recomendação:** Para evitar bloqueios de navegador (CORS) ou problemas de carregamento, recomenda-se usar a extensão **Live Server** do VS Code:
    * Abra a pasta do projeto no VS Code.
    * Clique com o botão direito no `index.html`.
    * Selecione **"Open with Live Server"**.

A aplicação abrirá no seu navegador padrão e já estará conectada ao backend.

---

## ✅ Funcionalidades Principais

* **Pacientes:** Cadastro, Listagem, Edição e Inativação (Exclusão Lógica).
* **Médicos:** Cadastro, Listagem e Inativação.
* **Consultas:**
    * Agendamento com validações de horário e disponibilidade.
    * Listagem de consultas.
    * Cancelamento com justificativa.

## 🧪 Usuários de Teste

Como o sistema inicia vazio, cadastre primeiro um **Médico** e um **Paciente** para poder realizar o agendamento de **Consultas**.
