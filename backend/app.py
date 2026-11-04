import os
import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "https://miauadote.tmctech.workers.dev",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
])

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
    # ?todos=1 (painel do admin) inclui os animais já adotados
    todos = request.args.get("todos") == "1"
    # ?limite=3 devolve só os 3 mais recentes
    limite = request.args.get("limite", type=int)

    sql = "SELECT * FROM animais"
    if not todos:
        sql += " WHERE adotado = 0"
    sql += " ORDER BY id DESC"

    parametros = ()
    if limite and limite > 0:
        sql += " LIMIT %s"
        parametros = (min(limite, 50),)

    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute(sql, parametros)
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
    descricao = dados.get("descricao")
    foto_url = dados.get("foto_url")
    foto_url2 = dados.get("foto_url2")
    foto_url3 = dados.get("foto_url3")
    foto_url4 = dados.get("foto_url4")
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
            
@app.patch("/animais/<int:id>/adotado")
def marcar_adotado(id):
    dados = request.get_json() or {}
    adotado = bool(dados.get("adotado"))

    conexao = None
    try:
        conexao = conectar()
        with conexao.cursor() as cursor:
            cursor.execute(
                "UPDATE animais SET adotado = %s WHERE id = %s", (adotado, id)
            )
            conexao.commit()
            return jsonify({"ok": True, "adotado": adotado})
    except Exception as erro:
        print(erro)
        return jsonify({"erro": "Erro ao atualizar animal"}), 500
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