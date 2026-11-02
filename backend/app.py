import os
import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # na Fase 7 você restringe ao endereço do site

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
def cadastrar():
    dados = request.get_json() or {}
    nome = dados.get("nome")
    especie = dados.get("especie")
    idade = dados.get("idade")
    porte = dados.get("porte")
    genero = dados.get("genero")
    raca = dados.get("raca") or "Vira-lata (SRD)"
    foto_url = dados.get("foto_url")
    descricao = dados.get("descricao")
    vacinado = bool(dados.get("vacinado"))
    castrado = bool(dados.get("castrado"))
    vermifugado = bool(dados.get("vermifugado"))

    if not nome or not especie or not idade or not porte:
        return jsonify({"erro": "Nome, espécie, idade e porte são obrigatórios"}), 400

    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute(
                """INSERT INTO animais
                   (nome, especie, idade, porte, genero, raca, foto_url,
                    descricao, vacinado, castrado, vermifugado)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (nome, especie, idade, porte, genero, raca, foto_url,
                 descricao, vacinado, castrado, vermifugado),
            )
            conexao.commit()
            return jsonify({"id": cursor.lastrowid}), 201
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao cadastrar animal"}), 500
    finally:
        if conexao:
            conexao.close()
            

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