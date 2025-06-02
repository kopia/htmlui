import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

export function GoBackButton() {
  const navigate = useNavigate();

  return (
    <Button size="sm" variant="warning" onClick={() => navigate(-1)}>
      <FontAwesomeIcon icon={faChevronLeft} /> Return{" "}
    </Button>
  );
}
