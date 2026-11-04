# ============================================================
# API DO MIAU (Flask + MySQL)
#
# Este arquivo é o app.py original COM AS ADIÇÕES:
#   1. CORS só para os sites do MiAu (antes liberava qualquer site)
#   2. POST /login      -> confere usuário/senha do administrador e devolve um token
#   3. @exige_admin     -> cadastrar, editar e excluir só funcionam com o token
#   4. PATCH /animais/<id> -> editar animal / marcar como adotado
#   5. GET /animais agora vem do mais novo para o mais antigo
#
# ANTES DE RODAR, no banco (uma vez):
#   ALTER TABLE animais ADD COLUMN adotado TINYINT(1) NOT NULL DEFAULT 0;
#   ALTER TABLE animais ADD COLUMN criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
#   (se alguma coluna já existir, o MySQL avisa e você pode ignorar)
#
# No arquivo .env, acrescente (além das variáveis DB_ que já existem):
#   SECRET_KEY=uma-frase-longa-e-aleatoria-que-so-voce-sabe
#   ADMIN_USUARIO=admin
#   ADMIN_SENHA=uma-senha-forte
# ============================================================

import hmac
import os
from functools import wraps

import pymysql
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from itsdangerous import BadSignature, URLSafeTimedSerializer

load_dotenv()

app = Flask(__name__)

# Sites que podem conversar com a API. Ajuste para os endereços reais.
SITES_PERMITIDOS = [
    "https://miauadote.tmctech.workers.dev",          # site público (Cloudflare)
    # "https://ENDERECO-DO-ADMIN",                    # site do administrador, quando existir
    "http://127.0.0.1:5500",                          # Live Server (testes no computador)
    "http://localhost:5500",
    "https://miau-adote-o-seu-companheiro.onrender.com"
]
CORS(app, origins=SITES_PERMITIDOS)

PASTA = os.path.dirname(os.path.abspath(__file__))

SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_USUARIO = os.getenv("ADMIN_USUARIO")
ADMIN_SENHA = os.getenv("ADMIN_SENHA")

if not SECRET_KEY or not ADMIN_USUARIO or not ADMIN_SENHA:
    raise RuntimeError("Defina SECRET_KEY, ADMIN_USUARIO e ADMIN_SENHA no arquivo .env")

serializador = URLSafeTimedSerializer(SECRET_KEY)
VALIDADE_TOKEN = 60 * 60 * 8  # o login vale por 8 horas


def conectar():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        ssl_ca=os.path.join(PASTA, "ca.pem"),
        cursorclass=pymysql.cursors.DictCursor,
    )


# ------------------------------------------------------------
# Login do administrador
# ------------------------------------------------------------
def exige_admin(funcao):
    """Use logo abaixo do @app.post/@app.patch/@app.delete das rotas do administrador."""
    @wraps(funcao)
    def protegida(*args, **kwargs):
        cabecalho = request.headers.get("Authorization", "")
        token = cabecalho.replace("Bearer ", "", 1)
        try:
            serializador.loads(token, max_age=VALIDADE_TOKEN)
        except BadSignature:  # token falso, vazio ou vencido
            return jsonify({"erro": "Não autorizado"}), 401
        return funcao(*args, **kwargs)
    return protegida


@app.post("/login")
def login():
    dados = request.get_json() or {}
    usuario = str(dados.get("usuario", ""))
    senha = str(dados.get("senha", ""))

    usuario_ok = hmac.compare_digest(usuario.encode(), ADMIN_USUARIO.encode())
    senha_ok = hmac.compare_digest(senha.encode(), ADMIN_SENHA.encode())

    if usuario_ok and senha_ok:
        return jsonify({"token": serializador.dumps({"admin": True})})
    return jsonify({"erro": "Usuário ou senha inválidos"}), 401


# ------------------------------------------------------------
# Animais
# ------------------------------------------------------------
@app.get("/animais")
def listar():
    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute("SELECT * FROM animais ORDER BY id DESC")
            return jsonify(cursor.fetchall())
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao buscar animais"}), 500
    finally:
        if conexao:
            conexao.close()


@app.get("/animais/<int:id>")
def buscar(id):
    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute("SELECT * FROM animais WHERE id = %s", (id,))
            animal = cursor.fetchone()
        if not animal:
            return jsonify({"erro": "Animal não encontrado"}), 404
        return jsonify(animal)
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao buscar animal"}), 500
    finally:
        if conexao:
            conexao.close()


@app.post("/animais")
@exige_admin
def cadastrar():
    dados = request.get_json() or {}
    nome = dados.get("nome")
    especie = dados.get("especie")
    idade = dados.get("idade")
    porte = dados.get("porte")
    genero = dados.get("genero")
    raca = dados.get("raca") or "Vira-lata (SRD)"
    descricao = dados.get("descricao")
    foto_url = dados.get("foto_url")
    foto_url2 = dados.get("foto_url_2")
    foto_url3 = dados.get("foto_url_3")
    foto_url4 = dados.get("foto_url_4")
    vacinado = bool(dados.get("vacinado"))
    castrado = bool(dados.get("castrado"))
    vermifugado = bool(dados.get("vermifugado"))

    if not nome or not especie or not idade or not porte or not genero:
        return jsonify({"erro": "Nome, espécie, idade, porte e gênero são obrigatórios"}), 400

    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute(
                """INSERT INTO animais
                   (nome, especie, idade, porte, genero, raca, descricao,
                    foto_url, foto_url2, foto_url3, foto_url4,
                    vacinado, castrado, vermifugado)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s,
                           %s, %s, %s, %s, %s, %s)""",
                (nome, especie, idade, porte, genero, raca, descricao,
                 foto_url, foto_url2, foto_url3, foto_url4,
                 vacinado, castrado, vermifugado),
            )
            conexao.commit()
            return jsonify({"id": cursor.lastrowid}), 201
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao cadastrar animal"}), 500
    finally:
        if conexao:
            conexao.close()


# Colunas que o PATCH pode alterar (lista fixa: protege contra campos inesperados)
COLUNAS_EDITAVEIS = {
    "nome", "especie", "idade", "porte", "genero", "raca", "descricao",
    "foto_url", "foto_url2", "foto_url3", "foto_url4",
    "vacinado", "castrado", "vermifugado", "adotado",
}


@app.patch("/animais/<int:id>")
@exige_admin
def atualizar(id):
    dados = request.get_json() or {}
    campos = {coluna: valor for coluna, valor in dados.items() if coluna in COLUNAS_EDITAVEIS}

    if not campos:
        return jsonify({"erro": "Nenhum campo válido para atualizar"}), 400

    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            # os nomes das colunas vêm da lista fixa acima; os valores vão como parâmetros
            partes = ", ".join(f"{coluna} = %s" for coluna in campos)
            cursor.execute(
                f"UPDATE animais SET {partes} WHERE id = %s",
                (*campos.values(), id),
            )
            conexao.commit()
            return jsonify({"ok": True})
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao atualizar animal"}), 500
    finally:
        if conexao:
            conexao.close()


@app.delete("/animais/<int:id>")
@exige_admin
def excluir(id):
    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute("DELETE FROM animais WHERE id = %s", (id,))
            conexao.commit()
            return jsonify({"ok": True})
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao excluir animal"}), 500
    finally:
        if conexao:
            conexao.close()


if __name__ == "__main__":
    app.run(port=3000, debug=True)
