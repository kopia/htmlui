import React from "react";
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { LabelColumn } from "../../src/components/policy-editor/LabelColumn";
import i18n from "../../src/utils/i18n";

describe("LabelColumn", () => {
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("updates labels and help text when the language changes", async () => {
    await i18n.changeLanguage("en");
    render(
      <LabelColumn
        name="Ignore Files"
        help="When set, ignore rules from the parent directory are ignored"
      />,
    );

    expect(screen.getByText("Ignore Files")).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage("pt-BR");
    });

    expect(screen.getByText("Ignorar arquivos")).toBeInTheDocument();
    expect(
      screen.getByText("Quando ativado, as regras de exclusão do diretório superior são ignoradas"),
    ).toBeInTheDocument();
  });
});
