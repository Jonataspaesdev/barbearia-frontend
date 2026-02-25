import React from "react";
import { Link } from "react-router-dom";
import "./LinksCutz.css";
import logo from "../assets/cutz-logo.png";

export default function LinksCutz() {
  const links = [
    {
      label: "Agendar com barbeiro",
      icon: "calendar",
      to: "/login",
      type: "internal",
    },
    {
      label: "Falar no WhatsApp",
      icon: "whatsapp",
      href: "https://wa.me/55SEUNUMEROAQUI", // 🔥 TROQUE AQUI
      type: "external",
    },
    {
      label: "Acessar site",
      icon: "link",
      href: "https://barbearia-frontend-two.vercel.app",
      type: "external",
    },
    {
      label: "Atendimento automático",
      icon: "bot",
      to: "/login",
      type: "internal",
    },
  ];

  return (
    <div className="cutzLinksPage">
      <div className="cutzGlow" />

      <main className="cutzCard">
        <header className="cutzHeader">
          <div className="cutzLogoWrap">
            <img className="cutzLogoImg" src={logo} alt="CUTZ" />
          </div>

          <h1 className="cutzTitle">
            <span className="cutzTitleWhite">CU</span>
            <span className="cutzTitleGreen">TZ</span>
          </h1>

          <p className="cutzSubtitle">
            Agende seu corte em segundos
          </p>
        </header>

        <section className="cutzButtons">
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
                  <span className="cutzBtnIcon">
                    {renderIcon(item.icon)}
                  </span>
                  <span className="cutzBtnText">{item.label}</span>
                  <span className="cutzBtnArrow">›</span>
                </a>
              );
            }

            return (
              <Link key={item.label} className="cutzBtn" to={item.to}>
                <span className="cutzBtnIcon">
                  {renderIcon(item.icon)}
                </span>
                <span className="cutzBtnText">{item.label}</span>
                <span className="cutzBtnArrow">›</span>
              </Link>
            );
          })}
        </section>

        <footer className="cutzFooter">
          <span className="cutzFooterDot" />
          <span className="cutzFooterText">
            CUTZ • Barbearia • {new Date().getFullYear()}
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

  if (name === "calendar") {
    return (
      <svg {...common}>
        <path
          d="M7 3v3M17 3v3M4 9h16M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

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
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}