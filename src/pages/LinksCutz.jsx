import React from "react";
import { Link } from "react-router-dom";
import "./LinksCutz.css";

import logo from "../assets/dom-ribeiro-logo.png";

export default function LinksCutz() {
  const links = [
    {
      label: "Agendamento rápido (Site)",
      icon: "link",
      href: "https://barbearia-frontend-two.vercel.app",
      type: "external",
    },
    {
      label: "Agendar com barbeiro (WhatsApp)",
      icon: "whatsapp",
      href: "https://wa.me/5561981854504",
      type: "external",
    },
    {
      label: "WhatsApp Business",
      icon: "whatsapp",
      href: "https://wa.me/SEU_LINK_AQUI", // você troca depois
      type: "external",
    },
    {
      label: "Catálogo de serviços",
      icon: "catalog",
      to: "/catalogo",
      type: "internal",
    },
  ];

  return (
    <div className="cutzLinksPage">
      <div className="cutzGlow" aria-hidden="true" />

      <main className="cutzCard" role="main">
        <header className="cutzHeader">
          <div className="cutzLogoWrap" aria-hidden="true">
            <img className="cutzLogoImg" src={logo} alt="Dom Ribeiro" />
          </div>

          <h1 className="cutzTitle">
            <span className="cutzTitleWhite">DOM</span>
            <span className="cutzTitleGreen"> RIBEIRO</span>
          </h1>

          <p className="cutzSubtitle">Agende seu corte em segundos</p>
        </header>

        <section className="cutzButtons" aria-label="Ações rápidas">
          {links.map((item) => {
            if (item.type === "external") {
              return (
                <a
                  key={item.label}
                  className="cutzBtn"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="cutzBtnIcon" aria-hidden="true">
                    {renderIcon(item.icon)}
                  </span>
                  <span className="cutzBtnText">{item.label}</span>
                  <span className="cutzBtnArrow" aria-hidden="true">
                    ›
                  </span>
                </a>
              );
            }

            return (
              <Link key={item.label} className="cutzBtn" to={item.to}>
                <span className="cutzBtnIcon" aria-hidden="true">
                  {renderIcon(item.icon)}
                </span>
                <span className="cutzBtnText">{item.label}</span>
                <span className="cutzBtnArrow" aria-hidden="true">
                  ›
                </span>
              </Link>
            );
          })}
        </section>

        <footer className="cutzFooter">
          <span className="cutzFooterText">
            DOM RIBEIRO • {new Date().getFullYear()}
          </span>
        </footer>
      </main>
    </div>
  );
}

function renderIcon(name) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (name === "whatsapp") {
    return (
      <svg {...common}>
        <path
          d="M20 11.5A8.5 8.5 0 0 1 7.1 19L4 20l1-3A8.5 8.5 0 1 1 20 11.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "link") {
    return (
      <svg {...common}>
        <path
          d="M10 13a5 5 0 0 1 0-7l.6-.6a5 5 0 0 1 7 7l-1.2 1.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 11a5 5 0 0 1 0 7l-.6.6a5 5 0 0 1-7-7l1.2-1.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // catalog
  return (
    <svg {...common}>
      <path
        d="M7 4h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 11h6M9 14h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}