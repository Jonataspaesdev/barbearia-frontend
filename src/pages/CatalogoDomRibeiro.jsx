import React from "react";
import { Link } from "react-router-dom";
import "./CatalogoDomRibeiro.css";

import tabela1 from "../assets/dom-ribeiro-tabela1.png";
import tabela2 from "../assets/dom-ribeiro-tabela2.png";
import logo from "../assets/dom-ribeiro-logo.png";

export default function CatalogoDomRibeiro() {
  return (
    <div className="catPage">
      <div className="catGlow" aria-hidden="true" />

      <main className="catCard">
        <header className="catHeader">
          <div className="catTop">
            <img className="catLogo" src={logo} alt="Dom Ribeiro" />
            <div className="catTitles">
              <h1 className="catTitle">Catálogo de Serviços</h1>
              <p className="catSub">Tabela de preços • Dom Ribeiro</p>
            </div>
          </div>

          <Link className="catBack" to="/links">← Voltar</Link>
        </header>

        <section className="catSection">
          <h2 className="catH2">Tabela completa</h2>
          <p className="catHint">Toque para ampliar (mobile) ou clique para zoom (PC).</p>

          <a className="catImgWrap" href={tabela1} target="_blank" rel="noreferrer">
            <img className="catImg" src={tabela1} alt="Tabela de preços - Espaço Terapêutico Dom Ribeiro" />
          </a>
        </section>

        <section className="catSection">
          <h2 className="catH2">Serviços básicos (masculino)</h2>

          <a className="catImgWrap" href={tabela2} target="_blank" rel="noreferrer">
            <img className="catImg" src={tabela2} alt="Tabela de preço - Dom Ribeiro" />
          </a>
        </section>

        <footer className="catFooter">
          DOM RIBEIRO • {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}