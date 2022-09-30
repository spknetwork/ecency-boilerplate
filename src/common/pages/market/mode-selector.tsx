import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { MarketMode } from "./market-mode";
import { _t } from "../../i18n";

interface Props {
  mode: MarketMode;
  onSelect: (mode: MarketMode) => void;
}

export const ModeSelector = ({ mode, onSelect }: Props) => {
  return (
    <ButtonGroup className="d-flex mb-5 mode-selector mx-auto">
      <Button active={mode === MarketMode.SWAP} onClick={() => onSelect(MarketMode.SWAP)}>
        {_t("Swap")}
      </Button>
      <Button active={mode === MarketMode.LIMIT} onClick={() => onSelect(MarketMode.LIMIT)}>
        {_t("Limit")}
      </Button>
      <Button
        active={mode === MarketMode.ADVANCED}
        onClick={() => onSelect(MarketMode.ADVANCED)}
        disabled={true}
      >
        {_t("Advanced")}
      </Button>
    </ButtonGroup>
  );
};
