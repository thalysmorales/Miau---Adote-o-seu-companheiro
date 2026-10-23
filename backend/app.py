import os
import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # depois restrinja para o endereço do seu site

PASTA = os.path.dirname(os.path.abspath(__file__))


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


# Listar todos os animais
@app.get("/animais")
def listar():
    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute("SELECT * FROM animais")
            return jsonify(cursor.fetchall())
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao buscar animais"}), 500
    finally:
        if conexao:
            conexao.close()


# Cadastrar um animal
@app.post("/animais")
def cadastrar():
    dados = request.get_json() or {}
    nome = dados.get("nome")
    raca = dados.get("raca")
    porte = dados.get("porte")
    genero = dados.get("genero")

    if not nome or not porte or not genero:
        return jsonify({"erro": "Nome, porte e gênero são obrigatórios"}), 400

    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute(
                "INSERT INTO animais (nome, raca, porte, genero) VALUES (%s, %s, %s, %s)",
                (nome, raca, porte, genero),
            )
            conexao.commit()
            return jsonify({"id": cursor.lastrowid}), 201
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao cadastrar animal"}), 500
    finally:
        if conexao:
            conexao.close()


# Excluir um animal
@app.delete("/animais/<int:id>")
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