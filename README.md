# MiAu — Adote o Seu Companheiro

**Conectando pessoas a novos companheiros e incentivando a adoção responsável!**

O **MiAu** é uma plataforma desenvolvida com o propósito de aproximar pessoas de animais que estão disponíveis para adoção, dando visibilidade aos cães e gatos acolhidos pela ONG Só Patas. A iniciativa busca facilitar o acesso às informações dos animais, apresentar suas histórias e incentivar a adoção responsável.

Mais do que um projeto de desenvolvimento web, o MiAu representa uma iniciativa de impacto social, utilizando a tecnologia como ferramenta de apoio à causa animal.

---

## Contexto Acadêmico

O projeto foi desenvolvido no âmbito da disciplina **Projeto Integrador I — Extensão Curricularizada**, do curso de **Sistemas de Informação** do Centro Universitário de Patos de Minas (UNIPAM).

A proposta surgiu da oportunidade de aplicar os conhecimentos adquiridos durante a formação acadêmica em uma iniciativa voltada a uma necessidade da comunidade, aproximando o desenvolvimento de soluções tecnológicas de uma causa social.

O trabalho foi realizado em colaboração com a **ONG Só Patas**, buscando contribuir para a divulgação dos animais disponíveis para adoção e para a conscientização sobre a importância da proteção animal.

**Coordenação acadêmica:** Professora Diane Braga.

---

## Objetivos do Projeto

- Incentivar a adoção responsável de cães e gatos.
- Facilitar o acesso às informações dos animais disponíveis para adoção.
- Dar maior visibilidade aos animais acolhidos pela ONG Só Patas.
- Divulgar informações e notícias relacionadas à causa animal.
- Utilizar a tecnologia para aproximar a comunidade das iniciativas de proteção animal.
- Aplicar, na prática, os conhecimentos adquiridos durante a formação acadêmica.

---

## Funcionalidades

O MiAu foi pensado para oferecer uma navegação simples e intuitiva, permitindo que os visitantes conheçam os animais e tenham acesso às informações da ONG.

### Para o público

- **Apresentação dos animais:** exibição de cães e gatos disponíveis para adoção, com filtros para facilitar a busca.
- **Informações individuais:** acesso aos detalhes e às características de cada animal.
- **Interesse na adoção:** possibilidade de demonstrar interesse em um animal.
- **Mural de notícias:** divulgação de conteúdos e novidades relacionados à ONG.
- **Apresentação da ONG:** informações sobre a instituição e seu trabalho.
- **Interface responsiva:** adaptação da experiência de navegação a diferentes tamanhos de tela.

### Para a ONG (área administrativa)

- **Acesso com login:** área restrita à administração da ONG.
- **Cadastro de animais:** inclusão de novos animais com suas informações e fotos.
- **Acompanhamento dos cadastros:** consulta dos animais já cadastrados.

---

## Como o projeto funciona

O sistema é dividido em partes que se comunicam entre si:

```
Site público ──┐
               ├──►  API (Python/Flask)  ──►  Banco de dados (MySQL)
Área admin  ───┘
      │
      └──► Fotos enviadas para o Cloudinary
```

- Os dois sites (público e administrativo) consomem a mesma **API**, responsável por ler e gravar os dados dos animais.
- As **fotos** dos animais ficam armazenadas no Cloudinary, e o banco de dados guarda apenas o endereço de cada imagem.
- As ações de cadastro, edição e exclusão só são aceitas pela API mediante **login do administrador**.

---

## Estrutura do Repositório

| Pasta | Conteúdo |
|---|---|
| `html/` | Site público (páginas, estilos, scripts e imagens) |
| `admin/` | Área administrativa (login, meus animais e novo cadastro) |
| `backend/` | API em Python/Flask |

---

## Tecnologias Utilizadas

| Tecnologia | Aplicação |
|---|---|
| HTML5 | Estruturação das páginas |
| CSS3 | Estilização e organização visual |
| JavaScript | Interações, funcionalidades e comunicação com a API |
| Bootstrap 5.3.8 | Apoio na construção de interfaces responsivas |
| Bootstrap Icons | Ícones utilizados na interface |
| Font Awesome | Biblioteca complementar de ícones |
| Python + Flask | API (back-end) |
| MySQL | Banco de dados |
| Cloudinary | Armazenamento das fotos dos animais |
| Cloudflare Workers | Publicação do site público e da área administrativa |
| Render | Hospedagem da API |
| Git | Controle de versão |
| GitHub | Hospedagem do código-fonte e colaboração |

---

## Acesse o Projeto

- **Site público:** [MiAu — Adote o Seu Companheiro](https://miauadote.tmctech.workers.dev/)
- **Área administrativa (login):** [Login do administrador](https://miauadote-login.tmctech.workers.dev/) — acesso restrito à administração da ONG.
- **Repositório no GitHub:** [github.com/thalysmorales/Miau---Adote-o-seu-companheiro](https://github.com/thalysmorales/Miau---Adote-o-seu-companheiro)

---

## Instituição Parceira

**ONG Só Patas**

O projeto foi desenvolvido em colaboração com a ONG Só Patas, instituição ligada à proteção animal. A parceria permitiu direcionar a proposta para uma necessidade real: ampliar a divulgação dos animais acolhidos e incentivar a aproximação entre possíveis adotantes e a causa animal.

---

## Equipe de Desenvolvimento

O MiAu foi desenvolvido de forma colaborativa pelos seguintes integrantes do curso de Sistemas de Informação do Centro Universitário de Patos de Minas (UNIPAM):

- **Marcelo Henrique Teixeira**
- **Paulo Henrique**
- **Ruan Arthur de Oliveira**
- **Ryan Nicollas Alves**
- **Thalys Morales**

---

## Considerações Finais

O MiAu demonstra como o desenvolvimento de soluções tecnológicas pode ir além da aplicação de conhecimentos técnicos, contribuindo também para iniciativas de relevância social.

Por meio da união entre tecnologia, colaboração e compromisso com a causa animal, o projeto busca fortalecer a divulgação da adoção responsável e aproximar a comunidade do trabalho realizado pela ONG Só Patas.

**Adotar é transformar vidas. E a tecnologia pode ajudar a tornar esse encontro possível!**