"use client";

import { useEffect, useState } from "react";
import { cards } from "@/data/cards";
import { supabase } from "@/lib/supabaseClient";

const steps = [
  "Emotion",
  "Situation",
  "Belief",
  "Timeline",
  "Response",
  "Alternative Beliefs",
  "Meaning-Making",
  "Final Response",
  "Reflection",
];

const EMOTION_WILD_CARD_ID = "emotion_wild_card";
const BELIEF_WILD_CARD_ID = "belief_wild_card";
const RESPONSE_WILD_CARD_ID = "response_wild_card";

type PlayerJourney = {
  emotion: string | null;
  customEmotion: string;
  customEmotionConfirmed: boolean;
  situationText: string;
  situationTextConfirmed: boolean;
  situationSharedAloud: boolean;
  belief: string | null;
  customBelief: string;
  customBeliefConfirmed: boolean;
  timelineDeclared: boolean;
  response: string | null;
  customResponse: string;
  customResponseConfirmed: boolean;
  responseReflection: string;
  responseReflectionConfirmed: boolean;
  responseSharedAloud: boolean;
  responseReadyToShare: boolean;
  readyForLevel2: boolean;
  finalBelief: string | null;
  customFinalBelief: string;
  customFinalBeliefConfirmed: boolean;
  finalEmotion: string | null;
  customFinalEmotion: string;
  customFinalEmotionConfirmed: boolean;
  timelineRedeclared: boolean;
  step7PicksConfirmed: boolean;
  finalResponse: string | null;
  finalResponseConfirmed: boolean;
  customFinalResponse: string;
  customFinalResponseConfirmed: boolean;
  reflectionText: string;
  reflectionTextConfirmed: boolean;
  reflectionSharedAloud: boolean;
};
type RoomPlayer = {
  id: string;
  player_name: string;
};
type BeliefOffer = {
  receiverIndex: number;
  giverIndex: number;
  beliefId: string;
};
type SavedPlayerSession = {
  roomCode: string;
  playerId: string;
  playerName: string;
  isHost: boolean;
};
function createEmptyJourney(): PlayerJourney {
  return {
    emotion: null,
    customEmotion: "",
    customEmotionConfirmed: false,
    situationText: "",
    situationTextConfirmed: false,
    situationSharedAloud: false,
    belief: null,
    customBelief: "",
    customBeliefConfirmed: false,
    timelineDeclared: false,
    response: null,
    customResponse: "",
    customResponseConfirmed: false,
    responseReflection: "",
    responseReflectionConfirmed: false,
    responseSharedAloud: false,
    responseReadyToShare: false,
    readyForLevel2: false,
    finalBelief: null,
    customFinalBelief: "",
    customFinalBeliefConfirmed: false,
    finalEmotion: null,
    customFinalEmotion: "",
    customFinalEmotionConfirmed: false,
    timelineRedeclared: false,
    step7PicksConfirmed: false,
    finalResponse: null,
    finalResponseConfirmed: false,
    customFinalResponse: "",
    customFinalResponseConfirmed: false,
    reflectionText: "",
    reflectionTextConfirmed: false,
    reflectionSharedAloud: false,
  };
}
function savePlayerSession(session: SavedPlayerSession) {
  localStorage.setItem("space-between-player-session", JSON.stringify(session));
}

function clearPlayerSession() {
  localStorage.removeItem("space-between-player-session");
}
export default function Home() {
  const [mode, setMode] = useState<
  "home" | "single" | "free" | "multiLobby" | "multi"
>(
    "home",
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  // Single-player state
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [customEmotion, setCustomEmotion] = useState("");
  const [selectedBelief, setSelectedBelief] = useState<string | null>(null);
  const [customBelief, setCustomBelief] = useState("");
  const [situationText, setSituationText] = useState("");
  const [situationSharedAloud, setSituationSharedAloud] = useState(false);
  const [timelineDeclared, setTimelineDeclared] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState("");
  const [responseReflection, setResponseReflection] = useState("");
  const [responseSharedAloud, setResponseSharedAloud] = useState(false);
  const [level1Complete, setLevel1Complete] = useState(false);
  const [alternativeBeliefs, setAlternativeBeliefs] = useState<string[]>([]);
  const [finalBelief, setFinalBelief] = useState<string | null>(null);
  const [finalEmotion, setFinalEmotion] = useState<string | null>(null);
  const [customFinalEmotion, setCustomFinalEmotion] = useState("");
  const [timelineRedeclared, setTimelineRedeclared] = useState(false);
  const [finalResponse, setFinalResponse] = useState<string | null>(null);
  const [customFinalResponse, setCustomFinalResponse] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSharedAloud, setReflectionSharedAloud] = useState(false);
  const [showClosingScreen, setShowClosingScreen] = useState(false);

  // Multiplayer state
  const [multiplayerJourneys, setMultiplayerJourneys] = useState<
    PlayerJourney[]
  >([]);
  const [multiplayerStep, setMultiplayerStep] = useState(0);
  const [currentReceiverIndex, setCurrentReceiverIndex] = useState(0);
  const [beliefOffers, setBeliefOffers] = useState<BeliefOffer[]>([]);
  const [promptReaders, setPromptReaders] = useState<number[]>([]);
  const [promptReadAloudStep, setPromptReadAloudStep] = useState(-1);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joinedPlayers, setJoinedPlayers] = useState<RoomPlayer[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const emotionCards = cards.filter((card) => card.type === "emotion");
  const beliefCards = cards.filter((card) => card.type === "belief");
  const responseCards = cards.filter((card) => card.type === "response");
  const [draftSituationText, setDraftSituationText] = useState("");
const [draftCustomEmotion, setDraftCustomEmotion] = useState("");
const [draftCustomBelief, setDraftCustomBelief] = useState("");
const [draftCustomResponse, setDraftCustomResponse] = useState("");
const [draftResponseReflection, setDraftResponseReflection] = useState("");
const [draftCustomFinalBelief, setDraftCustomFinalBelief] = useState("");
const [draftCustomFinalEmotion, setDraftCustomFinalEmotion] = useState("");
const [draftCustomFinalResponse, setDraftCustomFinalResponse] = useState("");
const [draftReflectionText, setDraftReflectionText] = useState("");
const [draftBeliefOfferId, setDraftBeliefOfferId] = useState<string | null>(null);

  const selectedEmotionCard = emotionCards.find(
    (card) => card.id === selectedEmotion,
  );

  const selectedResponseCard = responseCards.find(
    (card) => card.id === selectedResponse,
  );

  const singleEmotionText =
    selectedEmotion === EMOTION_WILD_CARD_ID
      ? customEmotion
      : selectedEmotionCard?.title;

  const singleResponseText =
    selectedResponse === RESPONSE_WILD_CARD_ID
      ? customResponse
      : selectedResponseCard?.title;

  const finalEmotionText =
    finalEmotion === EMOTION_WILD_CARD_ID
      ? customFinalEmotion
      : emotionCards.find((card) => card.id === finalEmotion)?.title;

  const finalResponseText =
    finalResponse === RESPONSE_WILD_CARD_ID
      ? customFinalResponse
      : responseCards.find((card) => card.id === finalResponse)?.title;

  const singleBeliefText =
    selectedBelief === BELIEF_WILD_CARD_ID
      ? customBelief
      : beliefCards.find((card) => card.id === selectedBelief)?.title;

  const finalBeliefText =
    finalBelief === BELIEF_WILD_CARD_ID
      ? customBelief
      : beliefCards.find((card) => card.id === finalBelief)?.title;

  const situationIsComplete =
    situationText.trim().length > 0 || situationSharedAloud;

  const beliefIsComplete =
    Boolean(selectedBelief) &&
    (selectedBelief !== BELIEF_WILD_CARD_ID || customBelief.trim().length > 0);

  const timelineIsComplete = timelineDeclared;

  const emotionIsComplete =
    Boolean(selectedEmotion) &&
    (selectedEmotion !== EMOTION_WILD_CARD_ID ||
      customEmotion.trim().length > 0);

  const finalEmotionIsComplete =
    Boolean(finalEmotion) &&
    (finalEmotion !== EMOTION_WILD_CARD_ID ||
      customFinalEmotion.trim().length > 0);

  const responseCardIsComplete =
    Boolean(selectedResponse) &&
    (selectedResponse !== RESPONSE_WILD_CARD_ID ||
      customResponse.trim().length > 0);

  const finalResponseIsComplete =
    Boolean(finalResponse) &&
    (finalResponse !== RESPONSE_WILD_CARD_ID ||
      customFinalResponse.trim().length > 0);

  const responseIsComplete =
    responseCardIsComplete &&
    (responseReflection.trim().length > 0 || responseSharedAloud);

  function resetGame() {
    setCurrentStep(0);
    setSelectedEmotion(null);
    setCustomEmotion("");
    setSelectedBelief(null);
    setCustomBelief("");
    setSituationText("");
    setSituationSharedAloud(false);
    setTimelineDeclared(false);
    setSelectedResponse(null);
    setCustomResponse("");
    setResponseReflection("");
    setResponseSharedAloud(false);
    setLevel1Complete(false);
    setAlternativeBeliefs([]);
    setFinalBelief(null);
    setFinalEmotion(null);
    setCustomFinalEmotion("");
    setTimelineRedeclared(false);
    setFinalResponse(null);
    setCustomFinalResponse("");
    setReflectionText("");
    setReflectionSharedAloud(false);
    setShowClosingScreen(false);
    setMultiplayerJourneys([]);
    setCurrentReceiverIndex(0);
    setBeliefOffers([]);
    setPromptReaders([]);
    setPromptReadAloudStep(-1);
  }
  async function leaveRoom() {
    const leavingRoomCode = roomCode;
    const leavingPlayerId = myPlayerId;

    if (leavingRoomCode && leavingPlayerId) {
      const leavingPlayerIndex = joinedPlayers.findIndex(
        (player) => player.id === leavingPlayerId,
      );

      if (leavingPlayerIndex >= 0) {
        await supabase
          .from("belief_offers")
          .delete()
          .eq("room_code", leavingRoomCode)
          .or(
            `giver_index.eq.${leavingPlayerIndex},receiver_index.eq.${leavingPlayerIndex}`,
          );
      }

      await supabase
        .from("player_journeys")
        .delete()
        .eq("room_code", leavingRoomCode)
        .eq("player_id", leavingPlayerId);

      await supabase
        .from("players")
        .delete()
        .eq("room_code", leavingRoomCode)
        .eq("id", leavingPlayerId);
    }

    clearPlayerSession();
    resetGame();

    setRoomCode("");
    setJoinCode("");
    setJoinError("");
    setPlayerName("");
    setJoinedPlayers([]);
    setMyPlayerId(null);
    setIsHost(false);
    setMultiplayerJourneys([]);
    setBeliefOffers([]);
    setPromptReaders([]);
    setPromptReadAloudStep(-1);
    setCurrentReceiverIndex(0);
    setMultiplayerStep(0);
    setShowClosingScreen(false);

    setMode("home");
  }

  function pickPromptReaders(totalSteps: number, totalPlayers: number) {
  const readers: number[] = [];

  const startIndex = Math.floor(Math.random() * Math.max(totalPlayers, 1));

  for (let i = 0; i < totalSteps; i++) {
    readers.push((startIndex + i) % Math.max(totalPlayers, 1));
  }

  setPromptReaders(readers);
  return readers;
}

  async function loadJoinedPlayers(code: string) {
    const { data, error } = await supabase
      .from("players")
      .select("id, player_name")
      .eq("room_code", code)
      .order("created_at", { ascending: true });

    if (error) {
      return [];
    }

    setJoinedPlayers(data);
    return data;
  }

  async function loadRoomStep(code: string) {
    const { data, error } = await supabase
      .from("rooms")
      .select(
        "current_step, current_receiver_index, prompt_readers, prompt_read_aloud_step",
      )
      .eq("room_code", code)
      .single();

    if (error || !data) {
      return;
    }

    setMultiplayerStep(data.current_step);
    setCurrentReceiverIndex(data.current_receiver_index ?? 0);
    setPromptReaders(Array.isArray(data.prompt_readers) ? data.prompt_readers : []);
    setPromptReadAloudStep(data.prompt_read_aloud_step ?? -1);
  }
  async function loadPlayerJourneys(code: string, players: RoomPlayer[]) {
    const { data, error } = await supabase
      .from("player_journeys")
      .select("player_id, journey")
      .eq("room_code", code);

    if (error) {
      return;
    }

    const journeysByPlayer = players.map((player) => {
      const existing = data.find((row) => row.player_id === player.id);
      return existing?.journey ?? createEmptyJourney();
    });

    setMultiplayerJourneys(journeysByPlayer);
  }
  async function loadBeliefOffers(code: string) {
    const { data, error } = await supabase
      .from("belief_offers")
      .select("receiver_index, giver_index, belief_id")
      .eq("room_code", code);

    if (error) {
      return;
    }

    setBeliefOffers(
      data.map((row) => ({
        receiverIndex: row.receiver_index,
        giverIndex: row.giver_index,
        beliefId: row.belief_id,
      })),
    );
  }
  async function updateRoomStep(step: number) {
    if (!roomCode) return;

    setMultiplayerStep(step);
    setPromptReadAloudStep(-1);

    const { error } = await supabase
      .from("rooms")
      .update({
        current_step: step,
        prompt_read_aloud_step: -1,
      })
      .eq("room_code", roomCode);

    if (error) {
    }
  }

  async function updateCurrentReceiverIndex(index: number) {
    if (!roomCode) return;

    setCurrentReceiverIndex(index);

    const { error } = await supabase
      .from("rooms")
      .update({
        current_receiver_index: index,
      })
      .eq("room_code", roomCode);

    if (error) {
    }
  }
  async function updatePromptReadAloudStep(step: number) {
    if (!roomCode) return;

    setPromptReadAloudStep(step);

    const { error } = await supabase
      .from("rooms")
      .update({
        prompt_read_aloud_step: step,
      })
      .eq("room_code", roomCode);

    if (error) {
    }
  }
  useEffect(() => {
    const saved = localStorage.getItem("space-between-player-session");

    if (!saved || mode !== "home") return;

    async function checkSavedSession() {
      const session = JSON.parse(saved!) as SavedPlayerSession;

      const shouldReconnect = window.confirm(
        `Rejoin room ${session.roomCode} as ${session.playerName}?`,
      );

      if (!shouldReconnect) {
        clearPlayerSession();
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("id, player_name")
        .eq("room_code", session.roomCode)
        .eq("id", session.playerId)
        .single();

      if (playerError || !playerData) {
        clearPlayerSession();
        alert("Could not reconnect. Please join the room again.");
        return;
      }

      setRoomCode(session.roomCode);
      setMyPlayerId(session.playerId);
      setPlayerName(session.playerName);

      const players = await loadJoinedPlayers(session.roomCode);
      const hostPlayerId = players[0]?.id;
      setIsHost(session.playerId === hostPlayerId);
      await loadRoomStep(session.roomCode);
      await loadPlayerJourneys(session.roomCode, players);
      await loadBeliefOffers(session.roomCode);

      const { data: roomData } = await supabase
        .from("rooms")
        .select("current_step")
        .eq("room_code", session.roomCode)
        .single();

      if ((roomData?.current_step ?? -1) < 0) {
        setMode("multiLobby");
      } else {
        setMode("multi");
      }
    }

    checkSavedSession();
  }, [mode]);
  useEffect(() => {
    if (!roomCode) return;

    async function initialiseRoom() {
      const players = await loadJoinedPlayers(roomCode);
      await loadRoomStep(roomCode);
      await loadPlayerJourneys(roomCode, players);
      await loadBeliefOffers(roomCode);
    }

    initialiseRoom();

    const playersChannel = supabase
      .channel(`players-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_code=eq.${roomCode}`,
        },
        async () => {
          const players = await loadJoinedPlayers(roomCode);
          await loadPlayerJourneys(roomCode, players);
          await loadBeliefOffers(roomCode);
        },
      )
      .subscribe();

    const roomChannel = supabase
      .channel(`room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const updatedRoom = payload.new as {
            current_step: number;
            current_receiver_index: number;
            prompt_readers?: number[];
            prompt_read_aloud_step?: number;
          };
          setMultiplayerStep(updatedRoom.current_step);
          setCurrentReceiverIndex(updatedRoom.current_receiver_index ?? 0);
          if (Array.isArray(updatedRoom.prompt_readers)) {
            setPromptReaders(updatedRoom.prompt_readers);
          }
          setPromptReadAloudStep(updatedRoom.prompt_read_aloud_step ?? -1);

          if (updatedRoom.current_step >= 0) {
            setMode("multi");
          }

         
  if (mode === "multiLobby") {
            setMode("multi");
          }
        },
      )
      .subscribe();
    const journeysChannel = supabase
      .channel(`player-journeys-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_journeys",
          filter: `room_code=eq.${roomCode}`,
        },
        async () => {
          const players = await loadJoinedPlayers(roomCode);
          await loadPlayerJourneys(roomCode, players);
        },
      )
      .subscribe();
    const beliefOffersChannel = supabase
      .channel(`belief-offers-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "belief_offers",
          filter: `room_code=eq.${roomCode}`,
        },
        async () => {
          await loadBeliefOffers(roomCode);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(journeysChannel);
      supabase.removeChannel(beliefOffersChannel);
    };
  }, [roomCode]);
useEffect(() => {
  const stepCard = document.getElementById("step-card");

  if (stepCard) {
    stepCard.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }
}, [multiplayerStep, currentStep, promptReadAloudStep]);
  const cardButtonStyle = (isSelected: boolean) => ({
    border: isSelected
      ? "4px solid #0f766e"
      : "2px solid rgba(255,255,255,0.7)",
    borderRadius: "24px",
    padding: "0",
    overflow: "hidden",
    background: "white",
    cursor: "pointer",
    transform: isSelected
      ? "translateY(-8px) scale(1.03)"
      : "translateY(0) scale(1)",
    boxShadow: isSelected
      ? "0 24px 50px rgba(15,118,110,0.28)"
      : "0 10px 25px rgba(0,0,0,0.10)",
    transition:
      "transform 180ms ease, box-shadow 180ms ease, border 180ms ease",
    position: "relative" as const,
  });

  const primaryButtonStyle = {
    padding: "14px 24px",
    borderRadius: "999px",
    border: "none",
    background: "#0f766e",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(15,118,110,0.24)",
  };

  const secondaryButtonStyle = {
    padding: "14px 24px",
    borderRadius: "999px",
    border: "none",
    background: "#e7e2d7",
    color: "#3f3a32",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const pageStyle = {
    minHeight: "100vh",
    padding: "32px",
    background:
      "radial-gradient(circle at top left, #f5dfb8 0, transparent 34%), linear-gradient(135deg, #f7f1e7 0%, #e8f4f1 48%, #f2eefb 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#1f2933",
  };

  const panelStyle = {
    padding: "28px",
    borderRadius: "32px",
    background: "rgba(255,255,255,0.70)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
  };

  const stepBadgeStyle = {
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#ccfbf1",
    color: "#115e59",
    fontWeight: "bold",
    fontSize: "14px",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  };

  function renderClosingScreen(multiplayer = false) {
    return (
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          padding: "50px 40px",
          borderRadius: "32px",
          background: "#fffdf8",
          boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            marginTop: 0,
            fontSize: "14px",
            fontWeight: "bold",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#0f766e",
          }}
        >
          The Space Between
        </p>

        <h2
          style={{
            fontSize: "42px",
            lineHeight: 1.15,
            marginTop: "12px",
            marginBottom: "24px",
          }}
        >
          Thank you for taking the time to process your emotions
          {multiplayer ? " together" : ""}.
        </h2>

        <p
          style={{
            fontSize: "22px",
            lineHeight: 1.8,
            color: "#52606d",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          Emotions move quickly. Meaning moves quietly.
        </p>

        <p
          style={{
            marginTop: "24px",
            fontSize: "20px",
            lineHeight: 1.8,
            color: "#52606d",
            maxWidth: "700px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Thank you for exploring the space between what happened, what you
          believed, what you felt, and how you chose to respond.
        </p>

        <div style={{ marginTop: "42px" }}>
          <button onClick={leaveRoom} style={primaryButtonStyle}>
            Return Home
          </button>
        </div>
      </div>
    );
  }
  function RoomCodeBadge() {
    if (!roomCode) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 9999,
          padding: "10px 14px",
          borderRadius: "999px",
          background: "#0f766e",
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
        }}
      >
        Room: {roomCode}
      </div>
    );
  }

  function ConfirmTextButton({
    confirmed,
    disabled,
    onConfirm,
    label,
    confirmedLabel,
  }: {
    confirmed: boolean;
    disabled?: boolean;
    onConfirm: () => void;
    label: string;
    confirmedLabel: string;
  }) {
    return (
      <button
        onClick={onConfirm}
        disabled={Boolean(disabled)}
        style={{
          marginTop: "14px",
          padding: "12px 18px",
          borderRadius: "999px",
          border: confirmed ? "2px solid #0f766e" : "2px solid #d8d2c4",
          background: confirmed ? "#ccfbf1" : "#fffdf8",
          color: confirmed ? "#115e59" : "#52606d",
          fontWeight: "bold",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {confirmed ? confirmedLabel : label}
      </button>
    );
  }

  function StepHeader({ title, label }: { title: string; label: string }) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: "24px" }}>
          {title}
        </h3>

        <div style={stepBadgeStyle}>{label}</div>
      </div>
    );
  }

  if (mode === "home") {
    return (
      <main style={pageStyle}>
        {roomCode && (
          <div
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              zIndex: 100,
              padding: "10px 14px",
              borderRadius: "999px",
              background: "#ccfbf1",
              color: "#115e59",
              fontWeight: "bold",
              fontSize: "14px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            Room: {roomCode}
          </div>
        )}

        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <section
            style={{
              marginTop: "40px",
              padding: "36px",
              borderRadius: "32px",
              background: "rgba(255,255,255,0.70)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "8px",
                fontSize: "44px",
                fontWeight: "bold",
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                color: "#0f766e",
              }}
            >
              The Space Between
            </p>

            <h1
              style={{
                margin: 0,
                maxWidth: "760px",
                fontSize: "32px",
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
              }}
            >
              An interactive card game for exploring the space between emotion
              and response
            </h1>

            <p
              style={{
                marginTop: "24px",
                maxWidth: "760px",
                fontSize: "19px",
                lineHeight: 1.7,
                color: "#52606d",
              }}
            >
              Choose an emotion, name what happened, notice the belief or story
              you are carrying, and choose a response with awareness.
            </p>

            <p
              style={{
                marginTop: "12px",
                maxWidth: "760px",
                fontSize: "19px",
                lineHeight: 1.7,
                color: "#52606d",
              }}
            >
              This game is not about fixing feelings. It is about slowing down
              enough to notice what is happening inside us, and what becomes
              possible when we see the space between stimulus and response.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "24px",
                marginTop: "36px",
              }}
            >
              <button
                onClick={() => {
                  resetGame();
                  setMode("single");
                }}
                onMouseEnter={() => setHoveredMode("single")}
                onMouseLeave={() => setHoveredMode(null)}
                style={{
                  padding: "28px",
                  borderRadius: "28px",
                  border:
                    hoveredMode === "single"
                      ? "2px solid #0f766e"
                      : "2px solid #d8d2c4",
                  background: hoveredMode === "single" ? "#ccfbf1" : "#fffdf8",
                  boxShadow:
                    hoveredMode === "single"
                      ? "0 18px 40px rgba(15,118,110,0.22)"
                      : "0 14px 30px rgba(15,118,110,0.10)",
                  transition: "all 180ms ease",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "26px" }}>Solo Mode</h2>
                <p
                  style={{
                    marginTop: "12px",
                    marginBottom: 0,
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: "#52606d",
                  }}
                >
                  A guided private reflection mode for personal emotional exploration.
                </p>
              </button>

              <button
                onClick={async () => {
                  const hostName = window.prompt(
                    "Enter your name as the host:",
                  );

                  if (!hostName || !hostName.trim()) {
                    return;
                  }
                  const roomCode = Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();

                  const { data, error } = await supabase.from("rooms").insert([
                    {
                      room_code: roomCode,
                      current_step: -1,
                      current_receiver_index: 0,
                      prompt_readers: [],
                      prompt_read_aloud_step: -1,
                    },
                  ]);

                  if (!error) {
                    setRoomCode(roomCode);
                    setIsHost(true);

                    const { data: playerData, error: playerError } =
                      await supabase
                        .from("players")
                        .insert([
                          {
                            room_code: roomCode,
                            player_name: hostName.trim(),
                          },
                        ])
                        .select("id")
                        .single();

                    if (!playerError && playerData) {
                      setMyPlayerId(playerData.id);

                      savePlayerSession({
                        roomCode,
                        playerId: playerData.id,
                        playerName: hostName.trim(),
                        isHost: true,
                      });
                    }

                    await loadJoinedPlayers(roomCode);
                    await loadRoomStep(roomCode);

                    setMode("multiLobby");
                  }
                }}
                onMouseEnter={() => setHoveredMode("multi")}
                onMouseLeave={() => setHoveredMode(null)}
                style={{
                  padding: "28px",
                  borderRadius: "28px",
                  border:
                    hoveredMode === "multi"
                      ? "2px solid #0f766e"
                      : "2px solid #d8d2c4",
                  background: hoveredMode === "multi" ? "#ccfbf1" : "#fffdf8",
                  boxShadow:
                    hoveredMode === "multi"
                      ? "0 18px 40px rgba(15,118,110,0.22)"
                      : "0 14px 30px rgba(15,118,110,0.10)",
                  transition: "all 180ms ease",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "26px" }}>Multiplayer Mode</h2>
                <p
                  style={{
                    marginTop: "12px",
                    marginBottom: 0,
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: "#52606d",
                  }}
                >
                  A guided reflection room for you and others
                  to explore your emotions together.
                </p>
              </button>

              <button
                onClick={() => {
                  resetGame();
                  setMode("free");
                }}
                onMouseEnter={() => setHoveredMode("free")}
                onMouseLeave={() => setHoveredMode(null)}
                style={{
                  padding: "28px",
                  borderRadius: "28px",
                  border:
                    hoveredMode === "free"
                      ? "2px solid #0f766e"
                      : "2px solid #d8d2c4",
                  background: hoveredMode === "free" ? "#ccfbf1" : "#fffdf8",
                  boxShadow:
                    hoveredMode === "free"
                      ? "0 18px 40px rgba(15,118,110,0.22)"
                      : "0 14px 30px rgba(15,118,110,0.10)",
                  transition: "all 180ms ease",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "26px" }}>Free Exploration</h2>
                <p
                  style={{
                    marginTop: "12px",
                    marginBottom: 0,
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: "#52606d",
                  }}
                >
                  Browse all emotion, belief, and response cards freely without
                  a step-by-step guided flow.
                </p>
              </button>
            </div>
            <div
              style={{
                marginTop: "36px",
                padding: "24px",
                borderRadius: "28px",
                background: "#fffdf8",
                boxShadow: "0 14px 30px rgba(15,118,110,0.10)",
                maxWidth: "520px",
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: "22px" }}>
                Join an existing Guided Multiplayer Room
              </h3>

              <p style={{ color: "#52606d", lineHeight: 1.6 }}>
                Enter a room code shared by another player.
              </p>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "16px 12px",
                  borderRadius: "16px",
                  border: "2px solid #d8d2c4",
                  fontSize: "16px",
                  background: "#fffdf8",
                  marginBottom: "14px",
                }}
              />
              <input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError("");
                }}
                placeholder="Enter room code"
                style={{
                  width: "100%",
                  minWidth: 0,
                  padding: "16px 12px",
                  borderRadius: "16px",
                  border: "2px solid #d8d2c4",
                  fontSize: "16px",
                  letterSpacing: "0.04em",
                  textTransform: "none",
                  background: "#fffdf8",
                  color: "#1f2933",
                  fontWeight: "bold",
                  boxSizing: "border-box",
                }}
              />

              {joinError && (
                <p style={{ color: "#b91c1c", marginTop: "12px" }}>
                  {joinError}
                </p>
              )}

              <button
                onClick={async () => {
                  const cleanedCode = joinCode.trim().toUpperCase();
                  if (!playerName.trim()) {
                    setJoinError("Please enter your name.");
                    return;
                  }
                  if (!cleanedCode) {
                    setJoinError("Please enter a room code.");
                    return;
                  }

                  const { data, error } = await supabase
                    .from("rooms")
                    .select("*")
                    .eq("room_code", cleanedCode)
                    .single();

                  if (error || !data) {
                    setJoinError(
                      "Room not found. Check the code and try again.",
                    );
                    return;
                  }

                  setRoomCode(data.room_code);
                  const { data: playerData, error: playerError } =
                    await supabase
                      .from("players")
                      .insert([
                        {
                          room_code: data.room_code,
                          player_name: playerName.trim(),
                        },
                      ])
                      .select("id")
                      .single();

                  if (playerError || !playerData) {
                    setJoinError("Could not join room. Please try again.");
                    return;
                  }
                  setRoomCode(data.room_code);
                  setMyPlayerId(playerData.id);
                  savePlayerSession({
                    roomCode: data.room_code,
                    playerId: playerData.id,
                    playerName: playerName.trim(),
                    isHost: false,
                  });
                  await loadJoinedPlayers(data.room_code);
                  await loadRoomStep(data.room_code);

                  setIsHost(false);
                  setMode("multiLobby");
                }}
                style={{
                  ...primaryButtonStyle,
                  marginTop: "18px",
                }}
              >
                Join Room
              </button>
            </div>
          </section>

          <div
            style={{
              marginTop: "56px",
              maxWidth: "700px",
              textAlign: "left",
              color: "#64748b",
              lineHeight: 1.7,
              fontSize: "15px",
            }}
          >
            <p style={{ marginBottom: "28px" }}>
              <strong>Designed by Aaron Rajoo</strong>
              <br />
              Lead Teacher for Character and Citizenship Education at Northland
              Secondary School
            </p>

            <p style={{ marginBottom: "28px" }}>
              In collaboration with Elsa Chen (School Staff Developer),
              <br />
              and colleagues from the Organisational Development and Psychology
              Branch:
              <br />
              Phyllis, Cara, and Hui Qin
            </p>

              <p style={{ marginBottom: "28px" }}>
              Big thanks to my beta testers for making this game usable;
              <br />
              Laureen, Elise, Mei Teng, Elizabeth, Atassha and Elsa!
            </p>

            <p
              style={{
                fontStyle: "italic",
                opacity: 0.85,
              }}
            >
              Inspired and adapted from “Let’s Unpack This” by The Happiness
              Initiative
            </p>
          </div>
        </div>
      </main>
    );
  }
if (mode === "free") {
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <button
          onClick={() => setMode("home")}
          style={{ ...secondaryButtonStyle, marginBottom: "24px" }}
        >
          ← Back
        </button>

        <section style={panelStyle}>
          <h1 style={{ marginTop: 0, fontSize: "42px" }}>
            Free Exploration
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#52606d",
              lineHeight: 1.7,
            }}
          >
            Browse all cards freely. There are no steps in this mode.
          </p>

          <h2 style={{ marginTop: "32px" }}>Emotion Cards</h2>

          <CardGrid
            cardsToShow={emotionCards}
            selectedId={null}
            onSelect={() => {}}
            cardButtonStyle={cardButtonStyle}
          />

          <h2 style={{ marginTop: "48px" }}>Belief Cards</h2>

          <CardGrid
            cardsToShow={beliefCards}
            selectedId={null}
            onSelect={() => {}}
            cardButtonStyle={cardButtonStyle}
          />

          <h2 style={{ marginTop: "48px" }}>Response Cards</h2>

          <CardGrid
            cardsToShow={responseCards}
            selectedId={null}
            onSelect={() => {}}
            cardButtonStyle={cardButtonStyle}
          />
        </section>
      </div>
    </main>
  );
}
  if (mode === "multiLobby") {
    return (
      <main style={pageStyle}>
        <RoomCodeBadge />
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <section
            style={{
              marginTop: "40px",
              padding: "36px",
              borderRadius: "32px",
              background: "rgba(255,255,255,0.70)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            }}
          >
            <button onClick={leaveRoom} style={secondaryButtonStyle}>
              ← Back
            </button>

            <p
              style={{
                marginTop: "32px",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#0f766e",
              }}
            >
              Shared Reflection Room
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                lineHeight: 1.15,
                letterSpacing: "-0.04em",
              }}
            >
              Multiplayer Lobby
            </h1>

            <p
              style={{
                marginTop: "18px",
                maxWidth: "700px",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#52606d",
              }}
            >
              Invite others with this room code. The host guides the group
              through each step together.
            </p>
            <div
              style={{
                marginTop: "28px",
                padding: "24px",
                borderRadius: "24px",
                background: "#ccfbf1",
                color: "#115e59",
                maxWidth: "420px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "bold",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Room Code
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "42px",
                  fontWeight: "bold",
                  letterSpacing: "0.12em",
                }}
              >
                {roomCode}
              </p>
            </div>
            <p
              style={{ fontSize: "18px", fontWeight: "bold", color: "#0f766e" }}
            >
              Current Stage:{" "}
              {multiplayerStep < 0 ? "Lobby" : `Step ${multiplayerStep + 1}`}
            </p>

            {isHost && (
              <button
                onClick={async () => {
                  if (joinedPlayers.length < 2 || !roomCode) return;
                  const readers = pickPromptReaders(10, joinedPlayers.length);
                  setPromptReadAloudStep(-1);
                  setCurrentReceiverIndex(0);
                  setMultiplayerStep(0);
                  await supabase
                    .from("rooms")
                    .update({
                      current_step: 0,
                      current_receiver_index: 0,
                      prompt_readers: readers,
                      prompt_read_aloud_step: -1,
                    })
                    .eq("room_code", roomCode);
                  setMode("multi");
                }}
                disabled={joinedPlayers.length < 2}
                style={{
                  ...primaryButtonStyle,
                  marginTop: "20px",
                  opacity: joinedPlayers.length >= 2 ? 1 : 0.4,
                  cursor: joinedPlayers.length >= 2 ? "pointer" : "not-allowed",
                }}
              >
                {joinedPlayers.length >= 2
                  ? "Start Game"
                  : "Waiting for another player"}
              </button>
            )}
            <div
              style={{
                marginTop: "30px",
                display: "grid",
                gap: "14px",
                maxWidth: "500px",
              }}
            >
              <div
                style={{
                  marginTop: "30px",
                  display: "grid",
                  gap: "14px",
                  maxWidth: "500px",
                }}
              >
                {joinedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    style={{
                      padding: "18px 20px",
                      borderRadius: "20px",
                      background: "#fffdf8",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    Player {index + 1}: {player.player_name}
                    {index === 0 ? " (Host)" : ""}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (mode === "multi") {
    const activePlayer = joinedPlayers.find(
      (player) => player.id === myPlayerId,
    );
    const myPlayerIndex = joinedPlayers.findIndex(
      (player) => player.id === myPlayerId,
    );
    const promptDefinitions = [
      {
        title: "Step 1 — Emotion",
        prompt: "What emotion feels most true right now or recently?",
      },
      {
        title: "Step 2 — Situation",
        prompt:
          "Describe what happened using facts only. Imagine reporting what a camera would have recorded.",
      },
      {
        title: "Step 3 — Belief",
        prompt:
          "What belief might be beneath the story you’re telling yourself about what happened?",
      },
      {
        title: "Step 4 — Declare the Emotion Timeline",
        prompt: "Take turns to declare your emotion timeline aloud.",
      },
      {
        title: "Step 5 — Response",
        prompt: "What is one response you are willing to try?",
      },
      {
        title: "Level 1 Complete",
        prompt:
          "We are moving into Level 2. Listen for other possible beliefs, not to fix anyone, but to notice what else could also be true.",
      },
      {
        title: "Step 6 — Alternative Beliefs",
        prompt:
          "This round, one player receives alternative beliefs. Everyone else silently offers one possible lens.",
      },
      {
        title: "Step 7 — Meaning-Making",
        prompt:
          "Review the alternative beliefs offered to you. Keep what feels useful, and leave what does not.",
      },
      {
        title: "Step 8 — Final Response",
        prompt: "Choose the response you now want to carry forward.",
      },
      {
        title: "Step 9 — Reflection",
        prompt:
          "Take a moment to reflect on what shifted, what stayed, and what you want to remember.",
      },
    ];

    const currentPrompt = promptDefinitions[multiplayerStep];
    const promptReaderIndex = promptReaders[multiplayerStep] ?? 0;
    const promptReaderPlayer = joinedPlayers[promptReaderIndex];
    const promptReader = promptReaderPlayer?.player_name || "Player";
    const isPromptReader = promptReaderPlayer?.id === myPlayerId;
    const promptHasBeenRead =
      multiplayerStep < 0 ||
      multiplayerStep >= 10 ||
      promptReadAloudStep === multiplayerStep ||
      !currentPrompt;

    const activeJourney =
      multiplayerJourneys[myPlayerIndex] ?? createEmptyJourney();

    const activeEmotionText =
      activeJourney.emotion === EMOTION_WILD_CARD_ID
        ? activeJourney.customEmotion
        : emotionCards.find((card) => card.id === activeJourney.emotion)?.title;

    const activeBeliefText =
      activeJourney.belief === BELIEF_WILD_CARD_ID
        ? activeJourney.customBelief
        : beliefCards.find((card) => card.id === activeJourney.belief)?.title;

    const activeResponseText =
      activeJourney.response === RESPONSE_WILD_CARD_ID
        ? activeJourney.customResponse
        : responseCards.find((card) => card.id === activeJourney.response)
            ?.title;

    const activeFinalBeliefText =
      activeJourney.finalBelief === BELIEF_WILD_CARD_ID
        ? activeJourney.customFinalBelief
        : beliefCards.find((card) => card.id === activeJourney.finalBelief)
            ?.title;

    const activeFinalEmotionText =
      activeJourney.finalEmotion === EMOTION_WILD_CARD_ID
        ? activeJourney.customFinalEmotion
        : emotionCards.find((card) => card.id === activeJourney.finalEmotion)
            ?.title;

    const activeFinalResponseText =
      activeJourney.finalResponse === RESPONSE_WILD_CARD_ID
        ? activeJourney.customFinalResponse
        : responseCards.find((card) => card.id === activeJourney.finalResponse)
            ?.title;
    
    const displayedBeliefText =
      multiplayerStep >= 7
        ? activeFinalBeliefText || activeBeliefText
        : activeBeliefText;

const displayedEmotionText =
  multiplayerStep >= 7
    ? activeFinalEmotionText || activeEmotionText
    : activeEmotionText;

const displayedResponseText =
  multiplayerStep >= 8
    ? activeFinalResponseText || activeResponseText
    : activeResponseText;

    async function updateActiveJourney(updates: Partial<PlayerJourney>) {
      if (myPlayerIndex < 0 || !myPlayerId || !roomCode) return;

      const currentJourney =
        multiplayerJourneys[myPlayerIndex] ?? createEmptyJourney();

      const updatedJourney = {
        ...currentJourney,
        ...updates,
      };

      setMultiplayerJourneys((journeys) => {
        const nextJourneys = joinedPlayers.map((_, index) => {
          return journeys[index] ?? createEmptyJourney();
        });

        nextJourneys[myPlayerIndex] = updatedJourney;

        return nextJourneys;
      });

      const { error } = await supabase.from("player_journeys").upsert(
        {
          room_code: roomCode,
          player_id: myPlayerId,
          journey: updatedJourney,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "room_code,player_id",
        },
      );
      if (error) {
      }
    }

    const journeysReady =
      joinedPlayers.length > 0 &&
      multiplayerJourneys.length === joinedPlayers.length;

    const allPlayersChoseEmotion =
      journeysReady &&
      multiplayerJourneys.every((journey) =>
        Boolean(
          journey.emotion &&
            (journey.emotion !== EMOTION_WILD_CARD_ID ||
              (journey.customEmotion.trim().length > 0 &&
                Boolean(journey.customEmotionConfirmed))),
        ),
      );

    const allPlayersSharedSituation =
  journeysReady &&
  multiplayerJourneys.every((journey) =>
    Boolean(
      journey.situationText.trim().length > 0 &&
        Boolean(journey.situationTextConfirmed) &&
        journey.situationSharedAloud,
    ),
  );

    const allPlayersChoseBelief =
      journeysReady &&
      multiplayerJourneys.every((journey) =>
        Boolean(
          journey.belief &&
            (journey.belief !== BELIEF_WILD_CARD_ID ||
              (journey.customBelief.trim().length > 0 &&
                Boolean(journey.customBeliefConfirmed))),
        ),
      );

    const allPlayersDeclaredTimeline =
      journeysReady &&
      multiplayerJourneys.every((journey) => journey.timelineDeclared);

    const allPlayersChoseResponse =
  journeysReady &&
  multiplayerJourneys.every((journey) =>
    Boolean(
      journey.response &&
        (journey.response !== RESPONSE_WILD_CARD_ID ||
          (journey.customResponse.trim().length > 0 &&
            Boolean(journey.customResponseConfirmed))) &&
        (journey.responseReflection.trim().length === 0 ||
          Boolean(journey.responseReflectionConfirmed)) &&
        journey.responseReadyToShare,
    ),
  );

    const allPlayersReadyForLevel2 =
      journeysReady &&
      multiplayerJourneys.every((journey) => journey.readyForLevel2);

    const currentReceiver =
      joinedPlayers[currentReceiverIndex]?.player_name || "Player";
const receiverJourney =
  multiplayerJourneys[currentReceiverIndex] ?? createEmptyJourney();

const receiverEmotionText =
  receiverJourney.emotion === EMOTION_WILD_CARD_ID
    ? receiverJourney.customEmotion
    : emotionCards.find(
        (card) => card.id === receiverJourney.emotion,
      )?.title;

const receiverBeliefText =
  receiverJourney.belief === BELIEF_WILD_CARD_ID
    ? receiverJourney.customBelief
    : beliefCards.find(
        (card) => card.id === receiverJourney.belief,
      )?.title;

const receiverResponseText =
  receiverJourney.response === RESPONSE_WILD_CARD_ID
    ? receiverJourney.customResponse
    : responseCards.find(
        (card) => card.id === receiverJourney.response,
      )?.title;
    const isActivePlayerReceiver = myPlayerIndex === currentReceiverIndex;

    const activePlayerOffer: BeliefOffer | undefined = beliefOffers.find(
      (offer) =>
        offer.receiverIndex === currentReceiverIndex &&
        offer.giverIndex === myPlayerIndex,
    );

    const offersForCurrentReceiver = beliefOffers.filter(
      (offer) => offer.receiverIndex === currentReceiverIndex,
    );

    const currentReceiverIsComplete =
      offersForCurrentReceiver.length === joinedPlayers.length - 1;

    const allPlayersRedeclaredTimeline =
      journeysReady &&
      multiplayerJourneys.every((journey) =>
        Boolean(
          journey.finalBelief &&
            (journey.finalBelief !== BELIEF_WILD_CARD_ID ||
              (journey.customFinalBelief.trim().length > 0 &&
                Boolean(journey.customFinalBeliefConfirmed))) &&
            journey.finalEmotion &&
            (journey.finalEmotion !== EMOTION_WILD_CARD_ID ||
              (journey.customFinalEmotion.trim().length > 0 &&
                Boolean(journey.customFinalEmotionConfirmed))) &&
            journey.step7PicksConfirmed &&
            journey.timelineRedeclared,
        ),
      );

    const allPlayersChoseFinalResponse =
      journeysReady &&
      multiplayerJourneys.every((journey) =>
        Boolean(
          journey.finalResponseConfirmed &&
            journey.finalResponse &&
            (journey.finalResponse !== RESPONSE_WILD_CARD_ID ||
              (journey.customFinalResponse.trim().length > 0 &&
                Boolean(journey.customFinalResponseConfirmed))),
        ),
      );

    const allPlayersReflected =
      journeysReady &&
      multiplayerJourneys.every((journey) =>
        Boolean(
          (journey.reflectionText.trim().length > 0 &&
            Boolean(journey.reflectionTextConfirmed)) ||
            journey.reflectionSharedAloud,
        ),
      );

    function isMyCurrentStepComplete(step: number) {
      switch (step) {
        case 0:
          return Boolean(
            activeJourney.emotion &&
              (activeJourney.emotion !== EMOTION_WILD_CARD_ID ||
                (activeJourney.customEmotion.trim().length > 0 &&
                  activeJourney.customEmotionConfirmed)),
          );
        case 1:
          return Boolean(
            activeJourney.situationText.trim().length > 0 &&
              activeJourney.situationTextConfirmed &&
              activeJourney.situationSharedAloud,
          );
        case 2:
          return Boolean(
            activeJourney.belief &&
              (activeJourney.belief !== BELIEF_WILD_CARD_ID ||
                (activeJourney.customBelief.trim().length > 0 &&
                  activeJourney.customBeliefConfirmed)),
          );
        case 3:
          return Boolean(activeJourney.timelineDeclared);
        case 4:
          return Boolean(
            activeJourney.response &&
              (activeJourney.response !== RESPONSE_WILD_CARD_ID ||
                (activeJourney.customResponse.trim().length > 0 &&
                  activeJourney.customResponseConfirmed)) &&
              ((activeJourney.responseReflection.trim().length > 0 &&
                activeJourney.responseReflectionConfirmed) ||
                activeJourney.responseSharedAloud) &&
              activeJourney.responseReadyToShare,
          );
        case 5:
          return Boolean(activeJourney.readyForLevel2);
        case 6:
          return isActivePlayerReceiver
            ? currentReceiverIsComplete
            : Boolean(activePlayerOffer);
        case 7:
          return Boolean(
            activeJourney.finalBelief &&
              (activeJourney.finalBelief !== BELIEF_WILD_CARD_ID ||
                (activeJourney.customFinalBelief.trim().length > 0 &&
                  activeJourney.customFinalBeliefConfirmed)) &&
              activeJourney.finalEmotion &&
              (activeJourney.finalEmotion !== EMOTION_WILD_CARD_ID ||
                (activeJourney.customFinalEmotion.trim().length > 0 &&
                  activeJourney.customFinalEmotionConfirmed)) &&
              activeJourney.step7PicksConfirmed &&
              activeJourney.timelineRedeclared,
          );
        case 8:
          return Boolean(
            activeJourney.finalResponseConfirmed &&
              activeJourney.finalResponse &&
              (activeJourney.finalResponse !== RESPONSE_WILD_CARD_ID ||
                (activeJourney.customFinalResponse.trim().length > 0 &&
                  activeJourney.customFinalResponseConfirmed)),
          );
        case 9:
          return Boolean(
            (activeJourney.reflectionText.trim().length > 0 &&
              activeJourney.reflectionTextConfirmed) ||
              activeJourney.reflectionSharedAloud,
          );
        default:
          return false;
      }
    }

    function renderReadyForHostNotice(isReady: boolean) {
      if (isHost) return null;

      if (isReady) {
        return (
          <button
            disabled
            style={{
              ...primaryButtonStyle,
              marginTop: "8px",
              opacity: 0.82,
              cursor: "default",
            }}
          >
            Ready for host to move the game forward
          </button>
        );
      }

      return (
        <p style={{ color: "#52606d", fontSize: "16px" }}>
          Complete your part, then wait for the host to continue.
        </p>
      );
    }

    function renderPromptIntroScreen() {
      if (!currentPrompt) return null;

      return (
        <div
          style={{
            marginTop: "32px",
            padding: "34px",
            borderRadius: "28px",
            background: "#fffdf8",
            boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: "12px",
              fontSize: "14px",
              fontWeight: "bold",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#0f766e",
            }}
          >
            Read this aloud
          </p>

          <h2 style={{ marginTop: 0, fontSize: "34px", lineHeight: 1.15 }}>
            {currentPrompt.title}
          </h2>

          <p style={{ fontSize: "18px", color: "#52606d", lineHeight: 1.7 }}>
            Reader: <strong>{promptReader}</strong>
          </p>

          <div
            style={{
              marginTop: "24px",
              padding: "28px",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.8)",
              fontSize: "26px",
              lineHeight: 1.5,
            }}
          >
            “{currentPrompt.prompt}”
          </div>

          {isPromptReader ? (
            <button
              onClick={async () => {
                await updatePromptReadAloudStep(multiplayerStep);
              }}
              style={{
                ...primaryButtonStyle,
                marginTop: "28px",
              }}
            >
              I have read this aloud
            </button>
          ) : (
            <p
              style={{ marginTop: "28px", color: "#52606d", fontSize: "17px" }}
            >
              Waiting for {promptReader} to read this aloud.
            </p>
          )}
        </div>
      );
    }

    return (
      <main style={pageStyle}>
        <RoomCodeBadge />
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <header
            style={{
              marginBottom: "32px",
              padding: "24px",
              borderRadius: "28px",
              background: "rgba(255,255,255,0.62)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            }}
          >
            <button
              onClick={leaveRoom}
              style={{
                ...secondaryButtonStyle,
                marginBottom: "18px",
              }}
            >
              ← Back to start
            </button>

            <p
              style={{
                margin: 0,
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#0f766e",
              }}
            >
              Shared Reflection Mode
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
              }}
            >
              The Space Between
            </h1>

            <p
              style={{
                marginTop: "12px",
                marginBottom: 0,
                maxWidth: "720px",
                fontSize: "18px",
                lineHeight: 1.6,
                color: "#52606d",
              }}
            >
              Move through the reflection together. The host controls the pace
              while each player makes their own choices.
            </p>
          </header>

          <section id="step-card" style={panelStyle}>
            {showClosingScreen && renderClosingScreen(true)}

            {multiplayerStep === 10 && renderClosingScreen(true)}

            {!showClosingScreen &&
              multiplayerStep !== 10 &&
              !promptHasBeenRead &&
              renderPromptIntroScreen()}

            {!showClosingScreen &&
              multiplayerStep !== 10 &&
              promptHasBeenRead && (
                <>
                 <h2 style={{ fontSize: "30px", marginTop: 0 }}>
  Active Player:{" "}
  {activePlayer?.player_name || "Unknown Player"}
</h2>

<div
  style={{
    position: "sticky",
top: "16px",
zIndex: 50,
    marginTop: "14px",
  marginBottom: "22px",
  padding: "18px 20px",
  borderRadius: "22px",
  background:
    "linear-gradient(135deg, rgba(224,247,250,0.95), rgba(236,253,245,0.92))",
  border: "2px solid rgba(14,116,144,0.18)",
  boxShadow: "0 10px 24px rgba(14,116,144,0.10)",
  fontSize: "15px",
  lineHeight: 1.7,
  color: "#164e63",
  backdropFilter: "blur(8px)",
  }}
>
 <div
  style={{
    marginBottom: "10px",
    fontWeight: "bold",
    fontSize: "13px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#0f766e",
  }}
>
  My Emotion Timeline
</div>{" "}
  [
  Situation:{" "}
  <strong>{activeJourney.situationText || "Not chosen yet"}</strong>
  {" "}– Belief:{" "}
  <strong>{displayedBeliefText || "Not chosen yet"}</strong>
  {" "}– Emotion:{" "}
  <strong>{displayedEmotionText || "Not chosen yet"}</strong>
  {" "}– Response:{" "}
  <strong>{displayedResponseText || "Not chosen yet"}</strong>
  ]
</div>
                </>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 0 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "26px",
                    borderRadius: "24px",
                    background: "#fffdf8",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <StepHeader
                    title="Step 1 — Emotion"
                    label={`Multiplayer Step ${multiplayerStep + 1}`}
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    <strong>{promptReader}</strong>, read this prompt aloud to
                    the table: “What emotion feels most true right now or
                    recently?”
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "20px",
                      marginTop: "24px",
                    }}
                  >
                    {emotionCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() =>
                          updateActiveJourney({
                            emotion: card.id,
                            customEmotion:
                              card.id === EMOTION_WILD_CARD_ID
                                ? activeJourney.customEmotion
                                : "",
                            customEmotionConfirmed: false,
                          })
                        }
                        style={cardButtonStyle(
                          activeJourney.emotion === card.id,
                        )}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: "100%", display: "block" }}
                        />
                      </button>
                    ))}
                  </div>

                  {activeJourney.emotion === EMOTION_WILD_CARD_ID && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.72)",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>Name your own emotion</h3>

                      <textarea
                        placeholder="What emotion are you feeling?"
                        value={draftCustomEmotion || activeJourney.customEmotion}
                        onChange={(e) => setDraftCustomEmotion(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "100px",
                          padding: "18px",
                          borderRadius: "18px",
                          border: "2px solid #d8d2c4",
                          fontSize: "17px",
                          resize: "vertical",
                          background: "#fffdf8",
                        }}
                      />
                      <ConfirmTextButton
                        confirmed={Boolean(activeJourney.customEmotionConfirmed)}
                        disabled={(draftCustomEmotion || activeJourney.customEmotion).trim().length === 0}
                        onConfirm={() =>
                          updateActiveJourney({
                            customEmotion: draftCustomEmotion || activeJourney.customEmotion,
                            customEmotionConfirmed: true,
                          })
                        }
                        label="Confirm this emotion"
                        confirmedLabel="✓ Emotion confirmed"
                      />
                    </div>
                  )}

                  {isHost && (
                  <StatusList
                    title="Step 1 Status"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) => {
                      const journey = multiplayerJourneys[index];

                      if (!journey) return false;

                     return Boolean(
                        journey.emotion &&
                          (journey.emotion !== EMOTION_WILD_CARD_ID ||
                            (journey.customEmotion.trim().length > 0 &&
                              Boolean(journey.customEmotionConfirmed))),
                      );
                    }}
                  />
                  )}

                  <div style={{ marginTop: "24px" }}>
                    {isHost && (
                      <button
                        onClick={async () => {
                          if (allPlayersChoseEmotion) await updateRoomStep(1);
                        }}
                        disabled={!allPlayersChoseEmotion}
                        style={{
                          ...primaryButtonStyle,
                          opacity: allPlayersChoseEmotion ? 1 : 0.4,
                          cursor: allPlayersChoseEmotion
                            ? "pointer"
                            : "not-allowed",
                        }}
                      >
                        Continue when everyone is ready
                      </button>
                    )}
                    {!isHost && renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 1 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "26px",
                    borderRadius: "24px",
                    background: "#fffdf8",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <StepHeader
                    title="Step 2 — Situation"
                    label={`Multiplayer Step ${multiplayerStep + 1}`}
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    <strong>{promptReader}</strong>, read this prompt aloud to
                    the table: “Describe what happened using facts only. Imagine
                    reporting what a camera would have recorded.”
                  </p>

                  <div
                    style={{
                      marginTop: "24px",
                      padding: "22px",
                      borderRadius: "22px",
                      background: "rgba(255,255,255,0.75)",
                    }}
                  >
                    <p style={{ marginTop: 0, fontWeight: "bold" }}>
                      Choose how you want to share:
                    </p>

                    <p style={{ color: "#52606d", lineHeight: 1.6 }}>
                      Type one short sentence about what happened. Confirm it, then share it aloud and click “I shared this aloud”.
                    </p>

                    <textarea
                      placeholder="Optional: type what happened here..."
                      value={draftSituationText || activeJourney.situationText}
                      onChange={(e) => setDraftSituationText(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "150px",
                        padding: "18px",
                        borderRadius: "18px",
                        border: "2px solid #d8d2c4",
                        fontSize: "17px",
                        resize: "vertical",
                        background: "#fffdf8",
                      }}
                    />
                    <ConfirmTextButton
                      confirmed={Boolean(activeJourney.situationTextConfirmed)}
                      disabled={(draftSituationText || activeJourney.situationText).trim().length === 0}
                      onConfirm={() =>
                        updateActiveJourney({
                          situationText: draftSituationText || activeJourney.situationText,
                          situationTextConfirmed: true,
                          situationSharedAloud: false,
                        })
                      }
                      label="Confirm typed situation"
                      confirmedLabel="✓ Situation confirmed"
                    />

                    <button
  disabled={!activeJourney.situationTextConfirmed}
  onClick={() =>
    updateActiveJourney({
      situationText: draftSituationText || activeJourney.situationText,
      situationTextConfirmed: true,
      situationSharedAloud: true,
    })
  }
                      style={{
                        marginTop: "18px",
                        padding: "12px 18px",
                        borderRadius: "999px",
                        border: activeJourney.situationSharedAloud
                          ? "2px solid #0f766e"
                          : "2px solid #d8d2c4",
                        background: activeJourney.situationSharedAloud
                          ? "#ccfbf1"
                          : "#fffdf8",
                        color: activeJourney.situationSharedAloud
                          ? "#115e59"
                          : "#52606d",
                        fontWeight: "bold",
                        opacity: activeJourney.situationTextConfirmed ? 1 : 0.45,
                        cursor: activeJourney.situationTextConfirmed ? "pointer" : "not-allowed",
                      }}
                    >
                      {activeJourney.situationSharedAloud
                        ? "✓ Shared aloud"
                        : "I shared this aloud"}
                    </button>
                  </div>

                  {isHost && (
                  <div
  style={{
    marginTop: "28px",
    padding: "20px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.75)",
  }}
>
  <h4 style={{ marginTop: 0 }}>Step 2 Status</h4>

  {joinedPlayers.map((player, index) => {
    const journey = multiplayerJourneys[index];

    const typedConfirmed = Boolean(
      journey?.situationText?.trim().length &&
        journey?.situationTextConfirmed,
    );

    const sharedAloud = Boolean(journey?.situationSharedAloud);

    return (
      <div
        key={player.id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "10px 0",
          borderTop:
            index === 0 ? "none" : "1px solid rgba(148,163,184,0.35)",
          fontSize: "17px",
        }}
      >
        <span>{player.player_name}</span>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            title="Typed and confirmed"
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: typedConfirmed ? "#ccfbf1" : "#f1f5f9",
              color: typedConfirmed ? "#115e59" : "#64748b",
              fontWeight: "bold",
              fontSize: "13px",
              border: typedConfirmed
                ? "1px solid #0f766e"
                : "1px solid #cbd5e1",
            }}
          >
            {typedConfirmed ? "✓" : "○"} Typed
          </span>

          <span
            title="Shared aloud"
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: sharedAloud ? "#ccfbf1" : "#f1f5f9",
              color: sharedAloud ? "#115e59" : "#64748b",
              fontWeight: "bold",
              fontSize: "13px",
              border: sharedAloud
                ? "1px solid #0f766e"
                : "1px solid #cbd5e1",
            }}
          >
            {sharedAloud ? "✓" : "○"} Shared
          </span>
        </div>
      </div>
    );
  })}
</div>
                  )}

                  <div style={{ marginTop: "24px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(0)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersSharedSituation)
                              await updateRoomStep(2);
                          }}
                          disabled={!allPlayersSharedSituation}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersSharedSituation ? 1 : 0.4,
                            cursor: allPlayersSharedSituation
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Continue when everyone is ready
                        </button>
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 2 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "26px",
                    borderRadius: "24px",
                    background: "#fffdf8",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <StepHeader
                    title="Step 3 — Belief"
                    label={`Multiplayer Step ${multiplayerStep + 1}`}
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    <strong>{promptReader}</strong>, read this prompt aloud to
                    the table: “What belief might be beneath the story you’re
                    telling yourself about what happened?”
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "20px",
                      marginTop: "24px",
                    }}
                  >
                    {beliefCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() =>
                          updateActiveJourney({
                            belief: card.id,
                            customBelief:
                              card.id === BELIEF_WILD_CARD_ID
                                ? activeJourney.customBelief
                                : "",
                            customBeliefConfirmed: false,
                          })
                        }
                        style={cardButtonStyle(
                          activeJourney.belief === card.id,
                        )}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: "100%", display: "block" }}
                        />
                      </button>
                    ))}
                  </div>

                  {activeJourney.belief === BELIEF_WILD_CARD_ID && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.72)",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>Name your own belief</h3>

                      <textarea
                        placeholder="What story are you telling yourself?"
                        value={draftCustomBelief || activeJourney.customBelief}
                        onChange={(e) => setDraftCustomBelief(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          padding: "18px",
                          borderRadius: "18px",
                          border: "2px solid #d8d2c4",
                          fontSize: "17px",
                          resize: "vertical",
                          background: "#fffdf8",
                        }}
                      />
                      <ConfirmTextButton
                        confirmed={Boolean(activeJourney.customBeliefConfirmed)}
                        disabled={(draftCustomBelief || activeJourney.customBelief).trim().length === 0}
                        onConfirm={() =>
                          updateActiveJourney({
                            customBelief: draftCustomBelief || activeJourney.customBelief,
                            customBeliefConfirmed: true,
                          })
                        }
                        label="Confirm this belief"
                        confirmedLabel="✓ Belief confirmed"
                      />
                    </div>
                  )}

                  {isHost && (
                  <StatusList
                    title="Step 3 Status"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) => {
                      const journey = multiplayerJourneys[index];
                      if (!journey) return false;
                      return Boolean(
                        journey.belief &&
                          (journey.belief !== BELIEF_WILD_CARD_ID ||
                            (journey.customBelief.trim().length > 0 &&
                              Boolean(journey.customBeliefConfirmed))),
                      );
                    }}
                  />
                  )}

                  <div style={{ marginTop: "24px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(1)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersChoseBelief) await updateRoomStep(3);
                          }}
                          disabled={!allPlayersChoseBelief}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersChoseBelief ? 1 : 0.4,
                            cursor: allPlayersChoseBelief
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Continue when everyone is ready
                        </button>
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 3 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "26px",
                    borderRadius: "24px",
                    background: "#fffdf8",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <StepHeader
                    title="Step 4 — Declare the Emotion Timeline"
                    label={`Multiplayer Step ${multiplayerStep + 1}`}
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    <strong>{promptReader}</strong>, read this prompt aloud to
                    the table: “Take turns to declare your emotion timeline aloud.”
                  </p>

                  <div
                    style={{
                      marginTop: "28px",
                      padding: "30px",
                      borderRadius: "28px",
                      background: "rgba(255,255,255,0.82)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                      fontSize: "26px",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "#777" }}>When </span>
                    <strong>
                      {activeJourney.situationText ||
                        "[the situation happened]"}
                    </strong>
                    <span style={{ color: "#777" }}> , I told myself </span>
                    <strong>{activeBeliefText}</strong>
                    <span style={{ color: "#777" }}> , so I felt </span>
                    <strong>{activeEmotionText}</strong>
                    <span>.</span>
                  </div>

                  <button
                    onClick={() =>
                      updateActiveJourney({
                        timelineDeclared: !activeJourney.timelineDeclared,
                      })
                    }
                    style={{
                      marginTop: "24px",
                      padding: "12px 18px",
                      borderRadius: "999px",
                      border: activeJourney.timelineDeclared
                        ? "2px solid #0f766e"
                        : "2px solid #d8d2c4",
                      background: activeJourney.timelineDeclared
                        ? "#ccfbf1"
                        : "#fffdf8",
                      color: activeJourney.timelineDeclared
                        ? "#115e59"
                        : "#52606d",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {activeJourney.timelineDeclared
                      ? "✓ Emotion timeline declared"
                      : "I have declared this aloud"}
                  </button>

                  {isHost && (
                  <StatusList
                    title="Step 4 Status"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) =>
                      Boolean(multiplayerJourneys[index]?.timelineDeclared)
                    }
                  />
                  )}

                  <div style={{ marginTop: "24px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(2)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersDeclaredTimeline)
                              await updateRoomStep(4);
                          }}
                          disabled={!allPlayersDeclaredTimeline}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersDeclaredTimeline ? 1 : 0.4,
                            cursor: allPlayersDeclaredTimeline
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Continue when everyone is ready
                        </button>
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 4 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "26px",
                    borderRadius: "24px",
                    background: "#fffdf8",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <StepHeader
                    title="Step 5 — Response"
                    label={`Multiplayer Step ${multiplayerStep + 1}`}
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    <strong>{promptReader}</strong>, read this prompt aloud to
                    the table: “What is one response you are willing to try?”
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "20px",
                      marginTop: "24px",
                    }}
                  >
                    {responseCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() =>
                          updateActiveJourney({
                            response: card.id,
                            customResponse:
                              card.id === RESPONSE_WILD_CARD_ID
                                ? activeJourney.customResponse
                                : "",
                            customResponseConfirmed: false,
                            responseReflectionConfirmed: false,
                            responseReadyToShare: false,
                          })
                        }
                        style={cardButtonStyle(
                          activeJourney.response === card.id,
                        )}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: "100%", display: "block" }}
                        />
                      </button>
                    ))}
                  </div>

                  {activeJourney.response === RESPONSE_WILD_CARD_ID && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.72)",
                        maxWidth: "760px",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>Name your own response</h3>

                      <textarea
                        placeholder="What response are you willing to try?"
                        value={draftCustomResponse || activeJourney.customResponse}
                        onChange={(e) => setDraftCustomResponse(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          padding: "18px",
                          borderRadius: "18px",
                          border: "2px solid #d8d2c4",
                          fontSize: "17px",
                          resize: "vertical",
                          background: "#fffdf8",
                        }}
                      />
                      <ConfirmTextButton
                        confirmed={Boolean(activeJourney.customResponseConfirmed)}
                        disabled={(draftCustomResponse || activeJourney.customResponse).trim().length === 0}
                        onConfirm={() =>
                          updateActiveJourney({
                            customResponse: draftCustomResponse || activeJourney.customResponse,
                            customResponseConfirmed: true,
                            responseReadyToShare: false,
                          })
                        }
                        label="Confirm this response"
                        confirmedLabel="✓ Response confirmed"
                      />
                    </div>
                  )}

                  {activeJourney.response && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.75)",
                      }}
                    >
                      <p style={{ marginTop: 0, fontWeight: "bold" }}>
                        Share about this response
                      </p>

                      <p style={{ color: "#52606d", lineHeight: 1.6 }}>
                        You may type about this response, or simply share it
                        aloud.
                      </p>

                      <textarea
                        placeholder="Optional: What draws you to this response?"
                        value={draftResponseReflection || activeJourney.responseReflection}
                        onChange={(e) => setDraftResponseReflection(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "130px",
                          padding: "18px",
                          borderRadius: "18px",
                          border: "2px solid #d8d2c4",
                          fontSize: "17px",
                          resize: "vertical",
                          background: "#fffdf8",
                        }}
                      />
                      <ConfirmTextButton
                        confirmed={Boolean(activeJourney.responseReflectionConfirmed)}
                        disabled={(draftResponseReflection || activeJourney.responseReflection).trim().length === 0}
                        onConfirm={() =>
                          updateActiveJourney({
                            responseReflection: draftResponseReflection || activeJourney.responseReflection,
                            responseReflectionConfirmed: true,
                            responseSharedAloud: false,
                            responseReadyToShare: false,
                          })
                        }
                        label="Confirm typed reflection"
                        confirmedLabel="✓ Reflection confirmed"
                      />
<ConfirmTextButton
                        confirmed={Boolean(activeJourney.responseReadyToShare)}
                        disabled={
  !(
    activeJourney.response &&
    (activeJourney.response !== RESPONSE_WILD_CARD_ID ||
      (activeJourney.customResponse.trim().length > 0 &&
        Boolean(activeJourney.customResponseConfirmed))) &&
    (
      activeJourney.responseReflection.trim().length === 0 ||
      Boolean(activeJourney.responseReflectionConfirmed)
    )
  )
                        }
                        onConfirm={() =>
                          updateActiveJourney({
                            responseReadyToShare: true,
                          })
                        }
                        label="Confirm response — ready to share in circle"
                        confirmedLabel="✓ Ready to share in circle"
                      />
                      <button
                         disabled={!activeJourney.responseReadyToShare}
  onClick={() =>
                          updateActiveJourney({
  responseSharedAloud: true,
})
                        }
                        style={{
                          marginTop: "18px",
                          padding: "12px 18px",
                          borderRadius: "999px",
                          border: activeJourney.responseSharedAloud
                            ? "2px solid #0f766e"
                            : "2px solid #d8d2c4",
                          background: activeJourney.responseSharedAloud
                            ? "#ccfbf1"
                            : "#fffdf8",
                          color: activeJourney.responseSharedAloud
                            ? "#115e59"
                            : "#52606d",
                          fontWeight: "bold",
                           cursor: activeJourney.responseReadyToShare ? "pointer" : "not-allowed",
    opacity: activeJourney.responseReadyToShare ? 1 : 0.45,
                        }}
                      >
                        {activeJourney.responseSharedAloud
                          ? "✓ Shared aloud"
                          : "I shared this aloud"}
                      </button>

                      
                    </div>
                  )}

                  {isHost && (
                  <StatusList
                    title="Ready to share in circle"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) => {
  const journey = multiplayerJourneys[index];

  if (!journey) return false;

  return Boolean(
  journey.response &&
    (journey.response !== RESPONSE_WILD_CARD_ID ||
      (journey.customResponse.trim().length > 0 &&
        Boolean(journey.customResponseConfirmed))) &&
    (journey.responseReflection.trim().length === 0 ||
      Boolean(journey.responseReflectionConfirmed)) &&
    journey.responseReadyToShare,
);
}}
                  />
                  )}

                  <div style={{ marginTop: "24px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(3)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersChoseResponse)
                              await updateRoomStep(5);
                          }}
                          disabled={!allPlayersChoseResponse}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersChoseResponse ? 1 : 0.4,
                            cursor: allPlayersChoseResponse
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Invite circle sharing when everyone is ready
                        </button>
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 5 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "30px",
                    borderRadius: "28px",
                    background: "#fffdf8",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                    Level 1 Complete
                  </h2>

                  <p
                    style={{ fontSize: "24px", lineHeight: 1.5, marginTop: 0 }}
                  >
                    You have each named what you felt, noticed the stories you
                    were carrying, and chosen a response with intention.
                  </p>

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    That is already meaningful work. Level 2 invites the group
                    to gently explore other possible beliefs, not to force
                    anyone to feel differently, but to notice what else could
                    also be true.
                  </p>

                  <button
                    onClick={() =>
                      updateActiveJourney({
                        readyForLevel2: !activeJourney.readyForLevel2,
                      })
                    }
                    style={{
                      marginTop: "24px",
                      padding: "12px 18px",
                      borderRadius: "999px",
                      border: activeJourney.readyForLevel2
                        ? "2px solid #0f766e"
                        : "2px solid #d8d2c4",
                      background: activeJourney.readyForLevel2
                        ? "#ccfbf1"
                        : "#fffdf8",
                      color: activeJourney.readyForLevel2
                        ? "#115e59"
                        : "#52606d",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {activeJourney.readyForLevel2
                      ? "✓ I am ready for Level 2"
                      : "I am ready for Level 2"}
                  </button>

                  {isHost && (
                  <StatusList
                    title="Ready for Level 2"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) =>
                      Boolean(multiplayerJourneys[index]?.readyForLevel2)
                    }
                  />
                  )}

                  <div style={{ marginTop: "24px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(4)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersReadyForLevel2) {
                              await updateCurrentReceiverIndex(0);
                              await updateRoomStep(6);
                            }
                          }}
                          disabled={!allPlayersReadyForLevel2}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersReadyForLevel2 ? 1 : 0.4,
                            cursor: allPlayersReadyForLevel2
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Continue to Level 2 together
                        </button>
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 6 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "30px",
                    borderRadius: "28px",
                    background: "#fffdf8",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <StepHeader
                    title="Step 6 — Alternative Beliefs"
                    label={`Receiving: ${currentReceiver}`}
                  />
<div
  style={{
      position: "sticky",
    top: "16px",
    zIndex: 60,
    marginTop: "18px",
    marginBottom: "24px",
    padding: "18px",
    borderRadius: "20px",
    background: "#f8fafc",
    border: "2px solid #94a3b8",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#334155",
  }}
>
  <p
    style={{
      marginTop: 0,
      marginBottom: "10px",
      fontWeight: "bold",
      color: "#0f172a",
    }}
  >
    Receiver’s Emotion Timeline: {currentReceiver}
  </p>

  <p style={{ margin: 0 }}>
  Situation:{" "}
  <strong>{receiverJourney.situationText || "Not shared yet"}</strong>
  {" "}– Belief:{" "}
  <strong>{receiverBeliefText || "Not chosen yet"}</strong>
  {" "}– Emotion:{" "}
  <strong>{receiverEmotionText || "Not chosen yet"}</strong>
  {" "}– Response:{" "}
  <strong>{receiverResponseText || "Not chosen yet"}</strong>
</p>
</div>
                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    This round, {currentReceiver} receives alternative beliefs.
                    Everyone else silently offers one possible lens. These are
                    not advice, explanations, or persuasion.
                  </p>

                  {isActivePlayerReceiver ? (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "26px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.75)",
                      }}
                    >
                      <h4 style={{ marginTop: 0, fontSize: "22px" }}>
                        {activePlayer?.player_name}, this is your receiving
                        round.
                      </h4>

                      <p
                        style={{
                          fontSize: "18px",
                          lineHeight: 1.7,
                          color: "#52606d",
                        }}
                      >
                        Wait quietly while the others offer alternative beliefs.
                        You do not need to explain, defend, or respond yet.
                      </p>
                    </div>
                  ) : activePlayerOffer ? (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "26px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.75)",
                      }}
                    >
                      <h4 style={{ marginTop: 0, fontSize: "22px" }}>
                        Offer submitted.
                      </h4>

                      <p
                        style={{
                          fontSize: "18px",
                          lineHeight: 1.7,
                          color: "#52606d",
                        }}
                      >
                        Thank you. Wait quietly while the others offer their
                        alternative beliefs.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: "18px",
                          lineHeight: 1.7,
                          color: "#52606d",
                        }}
                      >
                        {activePlayer?.player_name}, choose one alternative
                        belief for {currentReceiver}.
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(160px, 1fr))",
                          gap: "20px",
                          marginTop: "24px",
                        }}
                      >
                        {beliefCards
                          .filter(
                            (card) =>
                              card.id !== BELIEF_WILD_CARD_ID &&
                              card.id !==
                                multiplayerJourneys[currentReceiverIndex]
                                  .belief,
                          )
                          .map((card) => (
                            <button
                              key={card.id}
                              onClick={() => {
  setDraftBeliefOfferId(card.id);
}}
                              style={cardButtonStyle(
  draftBeliefOfferId === card.id
)}
                            >
                              <img
                                src={card.image}
                                alt={card.title}
                                style={{ width: "100%", display: "block" }}
                              />
                            </button>
                          ))}
                      </div>
                      <button
  disabled={!draftBeliefOfferId}
  onClick={async () => {
  if (myPlayerIndex < 0 || !roomCode || !draftBeliefOfferId) return;

  const confirmedBeliefOfferId = draftBeliefOfferId;

  setBeliefOffers((offers) => {
    const withoutCurrentOffer = offers.filter(
      (offer) =>
        !(
          offer.receiverIndex === currentReceiverIndex &&
          offer.giverIndex === myPlayerIndex
        ),
    );

    return [
      ...withoutCurrentOffer,
      {
        receiverIndex: currentReceiverIndex,
        giverIndex: myPlayerIndex,
        beliefId: confirmedBeliefOfferId,
      },
    ];
  });

  await supabase.from("belief_offers").upsert(
    {
      room_code: roomCode,
      receiver_index: currentReceiverIndex,
      giver_index: myPlayerIndex,
      belief_id: confirmedBeliefOfferId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "room_code,receiver_index,giver_index",
    },
  );

  setDraftBeliefOfferId(null);
}}
  style={{
    ...primaryButtonStyle,
    marginTop: "24px",
    opacity: draftBeliefOfferId ? 1 : 0.45,
    cursor: draftBeliefOfferId ? "pointer" : "not-allowed",
  }}
>
  Confirm this alternative belief
</button>
                    </>
                  )}

                  {isHost && (
                  <div
                    style={{
                      marginTop: "28px",
                      padding: "20px",
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.75)",
                    }}
                  >
                    <h4 style={{ marginTop: 0 }}>
  Anonymous offers for {currentReceiver}
</h4>

                    {joinedPlayers.map((player, index) => {
                      if (index === currentReceiverIndex) {
                        return (
                          <p
                            key={player.id}
                            style={{ margin: "8px 0", fontSize: "17px" }}
                          >
                            — {player.player_name} is receiving
                          </p>
                        );
                      }

                      const hasOffered = beliefOffers.some(
                        (offer) =>
                          offer.receiverIndex === currentReceiverIndex &&
                          offer.giverIndex === index,
                      );

                      return (
                        <p
                          key={player.id}
                          style={{ margin: "8px 0", fontSize: "17px" }}
                        >
                          {hasOffered ? "✓" : "○"} {player.player_name}
                        </p>
                      );
                    })}
                  </div>

                  )}

                  {isHost && currentReceiverIsComplete && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "#ecfdf5",
                        color: "#065f46",
                      }}
                    >
                      <strong>{currentReceiver}</strong> has received all
                      alternative beliefs.
                    </div>
                  )}


                  <div style={{ marginTop: "28px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(5)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        {currentReceiverIsComplete && (
                          <button
                            onClick={async () => {
                              if (
                                currentReceiverIndex <
                                joinedPlayers.length - 1
                              ) {
                                await updateCurrentReceiverIndex(
                                  currentReceiverIndex + 1,
                                );
                              } else {
                                setMultiplayerJourneys((journeys) =>
                                  journeys.map((journey) => ({
                                    ...journey,
                                    finalBelief: journey.belief,
                                    customFinalBelief:
                                      journey.belief === BELIEF_WILD_CARD_ID
                                        ? journey.customBelief
                                        : "",
                                    customFinalBeliefConfirmed: false,
                                    finalEmotion: journey.emotion,
                                    customFinalEmotion:
                                      journey.emotion === EMOTION_WILD_CARD_ID
                                        ? journey.customEmotion
                                        : "",
                                    customFinalEmotionConfirmed: false,
                                    timelineRedeclared: false,
                                  })),
                                );

                                await updateRoomStep(7);
                              }
                            }}
                            style={primaryButtonStyle}
                          >
                            {currentReceiverIndex < joinedPlayers.length - 1
                              ? "Next receiver"
                              : "Continue to Step 7"}
                          </button>
                        )}
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 7 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "30px",
                    borderRadius: "28px",
                    background: "#fffdf8",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <StepHeader
                    title="Step 7 — Meaning-Making"
                    label="Multiplayer Step 7"
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    <strong>{promptReader}</strong>, read this prompt to the
                    table: “Look at the alternative beliefs you received. You
                    may choose to keep your original belief or choose one that
                    was offered. Notice what feels most true and most helpful.”
                  </p>

                  <h4 style={{ marginTop: "28px", fontSize: "22px" }}>
                    Choose your final belief
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "20px",
                      marginTop: "18px",
                    }}
                  >
                    {[
                      {
                        beliefId: activeJourney.belief,
                        label: "Original belief",
                        giver: "You",
                      },
                      ...beliefOffers
                        .filter(
                          (offer) => offer.receiverIndex === myPlayerIndex,
                        )
                        .map((offer) => ({
                          beliefId: offer.beliefId,
                          label: "Alternative belief",
                          })),
                    ]
                      .filter((item, index, array) => {
                        if (!item.beliefId) return false;
                        if (item.beliefId !== BELIEF_WILD_CARD_ID) return true;
                        return (
                          array.findIndex(
                            (other) => other.beliefId === BELIEF_WILD_CARD_ID,
                          ) === index
                        );
                      })
                      .map((item, index) => {
                        const card = beliefCards.find(
                          (belief) => belief.id === item.beliefId,
                        );

                        if (!card) return null;

                        const isSelected =
                           (
    activeJourney.finalBelief ||
    activeJourney.belief
  ) === card.id;

                        return (
                          <button
                            key={`${item.beliefId}-${index}`}
                            onClick={() =>
                              updateActiveJourney({
                                finalBelief: card.id,
                                customFinalBelief:
                                  card.id === BELIEF_WILD_CARD_ID
                                    ? activeJourney.customFinalBelief
                                    : "",
                                customFinalBeliefConfirmed: false,
                                step7PicksConfirmed: false,
                                timelineRedeclared: false,
                              })
                            }
                            style={cardButtonStyle(
  (
    activeJourney.finalBelief ||
    activeJourney.belief
  ) === card.id,
)}
                          >
                            <div
                              style={{
                                padding: "10px",
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: "#52606d",
                                background: "#fffdf8",
                                textAlign: "left",
                              }}
                            >
                              {item.label}
                            </div>

                            <img
                              src={card.image}
                              alt={card.title}
                              style={{ width: "100%", display: "block" }}
                            />
                            {card.id === "belief_wild_card" &&
                              activeJourney.customBelief?.trim().length > 0 && (
                                <div
                                  style={{
                                    padding: "14px",
                                    fontSize: "15px",
                                    lineHeight: 1.5,
                                    color: "#115e59",
                                    background: "#ccfbf1",
                                    textAlign: "left",
                                  }}
                                >
                                  <strong>You wrote:</strong>
                                  <br />“{activeJourney.customBelief}”
                                </div>
                              )}
                          </button>
                        );
                      })}
                  </div>

                  {activeJourney.finalBelief === BELIEF_WILD_CARD_ID && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.72)",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>Name your final belief</h3>

                      <textarea
                        placeholder="What belief do you choose now?"
                        value={draftCustomFinalBelief || activeJourney.customFinalBelief}
                        onChange={(e) => setDraftCustomFinalBelief(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          padding: "18px",
                          borderRadius: "18px",
                          border: "2px solid #d8d2c4",
                          fontSize: "17px",
                          resize: "vertical",
                          background: "#fffdf8",
                        }}
                      />
                      <ConfirmTextButton
                        confirmed={Boolean(activeJourney.customFinalBeliefConfirmed)}
                        disabled={(draftCustomFinalBelief || activeJourney.customFinalBelief).trim().length === 0}
                        onConfirm={() =>
                          updateActiveJourney({
                            customFinalBelief: draftCustomFinalBelief || activeJourney.customFinalBelief,
                            customFinalBeliefConfirmed: true,
                            step7PicksConfirmed: false,
                            timelineRedeclared: false,
                          })
                        }
                        label="Confirm this belief"
                        confirmedLabel="✓ Belief confirmed"
                      />
                    </div>
                  )}

                  {activeJourney.finalBelief &&
                    (activeJourney.finalBelief !== BELIEF_WILD_CARD_ID ||
                      (activeJourney.customFinalBelief.trim().length > 0 &&
                        Boolean(activeJourney.customFinalBeliefConfirmed))) && (
                      <>
                        <h4 style={{ marginTop: "36px", fontSize: "22px" }}>
                          What emotion feels true now?
                        </h4>

                        <p style={{ fontSize: "17px", color: "#52606d" }}>
                          The emotion may change, soften, intensify, or stay the
                          same.
                        </p>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(160px, 1fr))",
                            gap: "20px",
                            marginTop: "18px",
                          }}
                        >
                          {emotionCards.map((card) => (
                            <button
                              key={card.id}
                              onClick={() =>
                                updateActiveJourney({
                                  finalEmotion: card.id,
                                  customFinalEmotion:
                                    card.id === EMOTION_WILD_CARD_ID
                                      ? activeJourney.customFinalEmotion
                                      : "",
                                  customFinalEmotionConfirmed: false,
                                  step7PicksConfirmed: false,
                                  timelineRedeclared: false,
                                })
                              }
                              style={cardButtonStyle(
  (
    activeJourney.finalEmotion ||
    activeJourney.emotion
  ) === card.id,
)}
                            >
                              <img
                                src={card.image}
                                alt={card.title}
                                style={{ width: "100%", display: "block" }}
                              />
                            </button>
                          ))}
                        </div>

                        {activeJourney.finalEmotion ===
                          EMOTION_WILD_CARD_ID && (
                          <div
                            style={{
                              marginTop: "28px",
                              padding: "24px",
                              borderRadius: "24px",
                              background: "rgba(255,255,255,0.72)",
                            }}
                          >
                            <h3 style={{ marginTop: 0 }}>
                              Name your current emotion
                            </h3>

                            <textarea
                              placeholder="What emotion feels true now?"
                              value={draftCustomFinalEmotion || activeJourney.customFinalEmotion}
                              onChange={(e) => setDraftCustomFinalEmotion(e.target.value)}
                              style={{
                                width: "100%",
                                minHeight: "100px",
                                padding: "18px",
                                borderRadius: "18px",
                                border: "2px solid #d8d2c4",
                                fontSize: "17px",
                                resize: "vertical",
                                background: "#fffdf8",
                              }}
                            />
                            <ConfirmTextButton
                              confirmed={Boolean(activeJourney.customFinalEmotionConfirmed)}
                              disabled={(draftCustomFinalEmotion || activeJourney.customFinalEmotion).trim().length === 0}
                              onConfirm={() =>
                                updateActiveJourney({
                                  customFinalEmotion: draftCustomFinalEmotion || activeJourney.customFinalEmotion,
                                  customFinalEmotionConfirmed: true,
                                  step7PicksConfirmed: false,
                                  timelineRedeclared: false,
                                })
                              }
                              label="Confirm this emotion"
                              confirmedLabel="✓ Emotion confirmed"
                            />
                          </div>
                        )}
                      </>
                    )}

                  {activeJourney.finalBelief &&
                    (activeJourney.finalBelief !== BELIEF_WILD_CARD_ID ||
                      (activeJourney.customFinalBelief.trim().length > 0 &&
                        Boolean(activeJourney.customFinalBeliefConfirmed))) &&
                    activeJourney.finalEmotion &&
                    (activeJourney.finalEmotion !== EMOTION_WILD_CARD_ID ||
                      (activeJourney.customFinalEmotion.trim().length > 0 &&
                        Boolean(activeJourney.customFinalEmotionConfirmed))) && (
                      <>
                        <div style={{ marginTop: "28px" }}>
                          <ConfirmTextButton
                            confirmed={Boolean(activeJourney.step7PicksConfirmed)}
                            disabled={
                              !(
                                activeJourney.finalBelief &&
                                (activeJourney.finalBelief !== BELIEF_WILD_CARD_ID ||
                                  (activeJourney.customFinalBelief.trim().length > 0 &&
                                    Boolean(activeJourney.customFinalBeliefConfirmed))) &&
                                activeJourney.finalEmotion &&
                                (activeJourney.finalEmotion !== EMOTION_WILD_CARD_ID ||
                                  (activeJourney.customFinalEmotion.trim().length > 0 &&
                                    Boolean(activeJourney.customFinalEmotionConfirmed)))
                              )
                            }
                            onConfirm={() =>
                              updateActiveJourney({
                                step7PicksConfirmed: true,
                              })
                            }
                            label="Confirm picks — ready to redeclare aloud"
                            confirmedLabel="✓ Picks confirmed — ready to redeclare"
                          />
                        </div>

                        <div
                          style={{
                            marginTop: "32px",
                            padding: "30px",
                            borderRadius: "28px",
                            background: "rgba(255,255,255,0.82)",
                            boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                            fontSize: "26px",
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: "#777" }}>When </span>
                          <strong>
                            {activeJourney.situationText ||
                              "[the situation happened]"}
                          </strong>
                          <span style={{ color: "#777" }}>
                            {" "}
                            , I now tell myself{" "}
                          </span>
                          <strong>{activeFinalBeliefText}</strong>
                          <span style={{ color: "#777" }}> , so I feel </span>
                          <strong>{activeFinalEmotionText}</strong>
                          <span>.</span>
                        </div>

                        <button
                          disabled={!activeJourney.step7PicksConfirmed}
                          onClick={() =>
                            updateActiveJourney({
                              timelineRedeclared: true,
                            })
                          }
                          style={{
                            marginTop: "24px",
                            padding: "12px 18px",
                            borderRadius: "999px",
                            border: activeJourney.timelineRedeclared
                              ? "2px solid #0f766e"
                              : "2px solid #d8d2c4",
                            background: activeJourney.timelineRedeclared
                              ? "#ccfbf1"
                              : "#fffdf8",
                            color: activeJourney.timelineRedeclared
                              ? "#115e59"
                              : "#52606d",
                            fontWeight: "bold",
                            opacity: activeJourney.step7PicksConfirmed ? 1 : 0.45,
                            cursor: activeJourney.step7PicksConfirmed ? "pointer" : "not-allowed",
                          }}
                        >
                          {activeJourney.timelineRedeclared
                            ? "✓ Emotion timeline redeclared"
                            : "I have redeclared this aloud"}
                        </button>
                      </>
                    )}

                  {isHost && (
                  <StatusList
                    title="Ready to redeclare"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) => {
                      const journey = multiplayerJourneys[index];
                      if (!journey) return false;
                      return Boolean(journey.step7PicksConfirmed);
                    }}
                  />
                  )}

                  {isHost && (
                  <StatusList
                    title="Step 7 Status"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) => {
                      const journey = multiplayerJourneys[index];
                      if (!journey) return false;
                      return Boolean(
                        journey.finalBelief &&
                          (journey.finalBelief !== BELIEF_WILD_CARD_ID ||
                            (journey.customFinalBelief.trim().length > 0 &&
                              Boolean(journey.customFinalBeliefConfirmed))) &&
                          journey.finalEmotion &&
                          (journey.finalEmotion !== EMOTION_WILD_CARD_ID ||
                            (journey.customFinalEmotion.trim().length > 0 &&
                              Boolean(journey.customFinalEmotionConfirmed))) &&
                          journey.step7PicksConfirmed &&
                          journey.timelineRedeclared,
                      );
                    }}
                  />
                  )}

                  <div style={{ marginTop: "28px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(6)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersRedeclaredTimeline) {
                              setMultiplayerJourneys((journeys) =>
                                journeys.map((journey) => ({
                                  ...journey,
                                  finalResponse:
                                    journey.finalResponse || journey.response,
                                  finalResponseConfirmed: false,
                                  customFinalResponse:
                                    journey.finalResponse ===
                                    RESPONSE_WILD_CARD_ID
                                      ? journey.customFinalResponse
                                      : journey.response ===
                                          RESPONSE_WILD_CARD_ID
                                        ? journey.customResponse
                                        : "",
                                  customFinalResponseConfirmed: false,
                                })),
                              );

                              await updateRoomStep(8);
                            }
                          }}
                          disabled={!allPlayersRedeclaredTimeline}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersRedeclaredTimeline ? 1 : 0.4,
                            cursor: allPlayersRedeclaredTimeline
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Continue when everyone is ready
                        </button>
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 8 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "30px",
                    borderRadius: "28px",
                    background: "#fffdf8",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <StepHeader
                    title="Step 8 — Final Response"
                    label="Multiplayer Step 8"
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    <strong>{promptReader}</strong>, read this prompt to the
                    table: “After considering other beliefs, decide if you want
                    to keep your response or choose a new one.”
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "20px",
                      marginTop: "24px",
                    }}
                  >
                    {responseCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() =>
                          updateActiveJourney({
                            finalResponse: card.id,
                            finalResponseConfirmed: false,
                            customFinalResponse:
                              card.id === RESPONSE_WILD_CARD_ID
                                ? activeJourney.customFinalResponse
                                : "",
                            customFinalResponseConfirmed: false,
                          })
                        }
                        style={cardButtonStyle(
                          (
    activeJourney.finalResponse ||
    activeJourney.response
  ) === card.id,
                        )}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: "100%", display: "block" }}
                        />
                      </button>
                    ))}
                  </div>

                  {activeJourney.finalResponse === RESPONSE_WILD_CARD_ID && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.72)",
                        maxWidth: "760px",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>Name your final response</h3>

                      <textarea
                        placeholder="What response do you choose now?"
                        value={draftCustomFinalResponse || activeJourney.customFinalResponse}
                        onChange={(e) => setDraftCustomFinalResponse(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          padding: "18px",
                          borderRadius: "18px",
                          border: "2px solid #d8d2c4",
                          fontSize: "17px",
                          resize: "vertical",
                          background: "#fffdf8",
                        }}
                      />
                      <ConfirmTextButton
                        confirmed={Boolean(activeJourney.customFinalResponseConfirmed)}
                        disabled={(draftCustomFinalResponse || activeJourney.customFinalResponse).trim().length === 0}
                        onConfirm={() =>
                          updateActiveJourney({
                            customFinalResponse: draftCustomFinalResponse || activeJourney.customFinalResponse,
                            customFinalResponseConfirmed: true,
                          })
                        }
                        label="Confirm this final response"
                        confirmedLabel="✓ Final response confirmed"
                      />
                    </div>
                  )}

                  {activeJourney.finalResponse &&
                    (activeJourney.finalResponse !== RESPONSE_WILD_CARD_ID ||
                      (activeJourney.customFinalResponse.trim().length > 0 &&
                        Boolean(activeJourney.customFinalResponseConfirmed))) && (
                      <div
                        style={{
                          marginTop: "32px",
                          padding: "28px",
                          borderRadius: "26px",
                          background: "rgba(255,255,255,0.82)",
                          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                        }}
                      >
                        <p
                          style={{
                            marginTop: 0,
                            fontSize: "18px",
                            color: "#52606d",
                          }}
                        >
                          Final response:
                        </p>

                        <p
                          style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            lineHeight: 1.4,
                            marginBottom: 0,
                          }}
                        >
                          {activeFinalResponseText}
                        </p>

                        <button
                          onClick={() =>
                            updateActiveJourney({
                              finalResponseConfirmed: true,
                            })
                          }
                          style={{
                            marginTop: "20px",
                            padding: "12px 18px",
                            borderRadius: "999px",
                            border: activeJourney.finalResponseConfirmed
                              ? "2px solid #0f766e"
                              : "2px solid #d8d2c4",
                            background: activeJourney.finalResponseConfirmed
                              ? "#ccfbf1"
                              : "#fffdf8",
                            color: activeJourney.finalResponseConfirmed
                              ? "#115e59"
                              : "#52606d",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          {activeJourney.finalResponseConfirmed
                            ? "✓ Response confirmed"
                            : "Confirm this response"}
                        </button>
                      </div>
                    )}

                  {isHost && (
                  <StatusList
                    title="Step 8 Status"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) => {
                      const journey = multiplayerJourneys[index];
                      if (!journey) return false;
                      return Boolean(
                        journey.finalResponseConfirmed &&
                        journey.finalResponse &&
                          (journey.finalResponse !== RESPONSE_WILD_CARD_ID ||
                            (journey.customFinalResponse.trim().length > 0 &&
                              Boolean(journey.customFinalResponseConfirmed))),
                      );
                    }}
                  />
                  )}

                  <div style={{ marginTop: "28px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(7)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersChoseFinalResponse)
                              await updateRoomStep(9);
                          }}
                          disabled={!allPlayersChoseFinalResponse}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersChoseFinalResponse ? 1 : 0.4,
                            cursor: allPlayersChoseFinalResponse
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Continue when everyone is ready
                        </button>
                      </>
                    ) : (
                      renderReadyForHostNotice(isMyCurrentStepComplete(multiplayerStep))
                    )}
                  </div>
                </div>
              )}

            {!showClosingScreen &&
              promptHasBeenRead &&
              multiplayerStep === 9 && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "30px",
                    borderRadius: "28px",
                    background: "#fffdf8",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <StepHeader
                    title="Step 9 — Reflection"
                    label="Multiplayer Step 9"
                  />

                  <p
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.7,
                      color: "#52606d",
                    }}
                  >
                    {activePlayer?.player_name}, take a moment to notice what
                    shifted, what stayed, and what opened up.
                  </p>

                  <div
                    style={{ marginTop: "24px", display: "grid", gap: "16px" }}
                  >
                    {[
                      "What did you notice about your beliefs?",
                      "Which belief felt most true, and which belief felt most helpful?",
                      "What was it like receiving or considering alternative beliefs?",
                      "What opened up for you that was not there before?",
                    ].map((question) => (
                      <div
                        key={question}
                        style={{
                          padding: "20px",
                          borderRadius: "22px",
                          background: "rgba(255,255,255,0.75)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                          fontSize: "19px",
                          lineHeight: 1.5,
                          fontWeight: "bold",
                        }}
                      >
                        {question}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "28px",
                      padding: "26px",
                      borderRadius: "24px",
                      background: "rgba(255,255,255,0.82)",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                    }}
                  >
                    <h4 style={{ marginTop: 0, fontSize: "22px" }}>
                      Your final emotion timeline
                    </h4>

                    <p style={{ fontSize: "22px", lineHeight: 1.6 }}>
                      When{" "}
                      <strong>
                        {activeJourney.situationText ||
                          "[the situation happened]"}
                      </strong>
                      , I now tell myself{" "}
                      <strong>{activeFinalBeliefText}</strong>, so I feel{" "}
                      <strong>{activeFinalEmotionText}</strong>. I choose to{" "}
                      <strong>{activeFinalResponseText}</strong>.
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "28px",
                      padding: "26px",
                      borderRadius: "24px",
                      background: "rgba(255,255,255,0.75)",
                    }}
                  >
                    <h4 style={{ marginTop: 0, fontSize: "22px" }}>
                      Reflection Space
                    </h4>

                    <p
                      style={{
                        fontSize: "17px",
                        lineHeight: 1.7,
                        color: "#52606d",
                      }}
                    >
                      You may write about what you noticed, or simply share it
                      aloud.
                    </p>

                    <textarea
                      placeholder="What are you noticing now?"
                      value={draftReflectionText || activeJourney.reflectionText}
                      onChange={(e) => setDraftReflectionText(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "160px",
                        marginTop: "14px",
                        padding: "18px",
                        borderRadius: "18px",
                        border: "2px solid #d8d2c4",
                        fontSize: "17px",
                        resize: "vertical",
                        background: "#fffdf8",
                      }}
                    />
                    <ConfirmTextButton
                      confirmed={Boolean(activeJourney.reflectionTextConfirmed)}
                      disabled={(draftReflectionText || activeJourney.reflectionText).trim().length === 0}
                      onConfirm={() =>
                        updateActiveJourney({
                          reflectionText: draftReflectionText || activeJourney.reflectionText,
                          reflectionTextConfirmed: true,
                          reflectionSharedAloud: false,
                        })
                      }
                      label="Confirm typed reflection"
                      confirmedLabel="✓ Reflection confirmed"
                    />

                    <button
                      onClick={() =>
                        updateActiveJourney({
                          reflectionSharedAloud:
                            !activeJourney.reflectionSharedAloud,
                          reflectionTextConfirmed: false,
                        })
                      }
                      style={{
                        marginTop: "18px",
                        padding: "12px 18px",
                        borderRadius: "999px",
                        border: activeJourney.reflectionSharedAloud
                          ? "2px solid #0f766e"
                          : "2px solid #d8d2c4",
                        background: activeJourney.reflectionSharedAloud
                          ? "#ccfbf1"
                          : "#fffdf8",
                        color: activeJourney.reflectionSharedAloud
                          ? "#115e59"
                          : "#52606d",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      {activeJourney.reflectionSharedAloud
                        ? "✓ Shared aloud"
                        : "I shared this aloud"}
                    </button>
                  </div>

                  {isHost && (
                  <StatusList
                    title="Step 9 Status"
                    players={joinedPlayers.map((player) => player.player_name)}
                    done={(index) => {
                      const journey = multiplayerJourneys[index];
                      if (!journey) return false;
                      return Boolean(
                        (journey.reflectionText.trim().length > 0 &&
                          Boolean(journey.reflectionTextConfirmed)) ||
                          journey.reflectionSharedAloud,
                      );
                    }}
                  />
                  )}

                  <div style={{ marginTop: "28px" }}>
                    {isHost ? (
                      <>
                        <button
                          onClick={async () => await updateRoomStep(8)}
                          style={{
                            ...secondaryButtonStyle,
                            marginRight: "12px",
                          }}
                        >
                          Back
                        </button>

                        <button
                          onClick={async () => {
                            if (allPlayersReflected) await updateRoomStep(10);
                          }}
                          disabled={!allPlayersReflected}
                          style={{
                            ...primaryButtonStyle,
                            opacity: allPlayersReflected ? 1 : 0.4,
                            cursor: allPlayersReflected
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Complete the game
                        </button>
                      </>
                    ) : (
                      <p style={{ color: "#191c1f", fontSize: "16px" }}>
                        Waiting for the host to complete the game.
                      </p>
                    )}
                  </div>
                </div>
              )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header
          style={{
            marginBottom: "32px",
            padding: "24px",
            borderRadius: "28px",
            background: "rgba(255,255,255,0.62)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
          }}
        >
          <button
            onClick={leaveRoom}
            style={{
              ...secondaryButtonStyle,
              marginBottom: "18px",
            }}
          >
            ← Back to start
          </button>

          <p
            style={{
              margin: 0,
              marginBottom: "8px",
              fontSize: "44px",
              fontWeight: "bold",
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "#0f766e",
            }}
          >
            The Space Between
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            An emotion card game for exploring the space between emotion and
            response
          </h1>

          <p
            style={{
              marginTop: "12px",
              marginBottom: "22px",
              maxWidth: "680px",
              fontSize: "18px",
              lineHeight: 1.6,
              color: "#52606d",
            }}
          >
            Explore the space between what happened, what you believed, what you
            felt, and how you choose to respond.
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {steps.map((step, index) => (
              <div
                key={step}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  background:
                    index === currentStep
                      ? "#0f766e"
                      : index < currentStep
                        ? "#ccfbf1"
                        : "rgba(255,255,255,0.75)",
                  color:
                    index === currentStep
                      ? "white"
                      : index < currentStep
                        ? "#115e59"
                        : "#64748b",
                }}
              >
                {index + 1}. {step}
              </div>
            ))}
          </div>
        </header>

        <section style={panelStyle}>
          {showClosingScreen && renderClosingScreen(false)}

          {!showClosingScreen && level1Complete && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Level 1 Complete
              </h2>

              <div
                style={{
                  marginTop: "24px",
                  padding: "30px",
                  borderRadius: "28px",
                  background: "#fffdf8",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  maxWidth: "800px",
                }}
              >
                <p style={{ fontSize: "24px", lineHeight: 1.5, marginTop: 0 }}>
                  You have named what you felt, noticed the story you were
                  carrying, and chosen a response with intention.
                </p>

                <p
                  style={{
                    fontSize: "18px",
                    lineHeight: 1.7,
                    color: "#52606d",
                  }}
                >
                  That is already meaningful work. Level 2 invites you to gently
                  explore other possible beliefs, not to force yourself to feel
                  differently, but to notice what else could also be true.
                </p>

                <div style={{ marginTop: "28px" }}>
                  <button
                    onClick={() => {
                      setLevel1Complete(false);
                      setCurrentStep(5);
                    }}
                    style={{ ...primaryButtonStyle, marginRight: "12px" }}
                  >
                    Continue to Level 2
                  </button>

                  <button
                    onClick={() => {
                      setLevel1Complete(false);
                    }}
                    style={secondaryButtonStyle}
                  >
                    Stay with Level 1
                  </button>
                </div>
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 0 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 1 — Emotion
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                What emotion feels most true right now or recently?
              </p>

              <CardGrid
                cardsToShow={emotionCards}
                selectedId={selectedEmotion}
                onSelect={(id) => {
                  setSelectedEmotion(id);
                  if (id !== EMOTION_WILD_CARD_ID) {
                    setCustomEmotion("");
                  }
                }}
                cardButtonStyle={cardButtonStyle}
              />

              {selectedEmotion === EMOTION_WILD_CARD_ID && (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "24px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.72)",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Name your own emotion</h3>

                  <textarea
                    placeholder="What emotion are you feeling?"
                    value={customEmotion}
                    onChange={(e) => setCustomEmotion(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "18px",
                      borderRadius: "18px",
                      border: "2px solid #d8d2c4",
                      fontSize: "17px",
                      resize: "vertical",
                      background: "#fffdf8",
                    }}
                  />
                </div>
              )}

              {emotionIsComplete && (
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{ ...primaryButtonStyle, marginTop: "32px" }}
                >
                  Continue
                </button>
              )}
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 1 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 2 — Situation
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                Describe what happened using facts only. Imagine reporting what
                a camera would have recorded.
              </p>

              <div
                style={{
                  marginTop: "24px",
                  padding: "24px",
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.82)",
                  maxWidth: "760px",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ marginTop: 0, fontWeight: "bold" }}>
                  Choose how you want to share:
                </p>

                <p style={{ color: "#52606d", lineHeight: 1.6 }}>
                  If you are playing in person, you can simply say it aloud. If
                  you are playing online or want to record it, type it below.
                </p>

                <textarea
                  placeholder="Optional: type what happened here..."
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "160px",
                    padding: "18px",
                    borderRadius: "18px",
                    border: "2px solid #d8d2c4",
                    fontSize: "18px",
                    resize: "vertical",
                    outline: "none",
                    background: "#fffdf8",
                  }}
                />

                <p
                  style={{ marginTop: "12px", fontSize: "14px", color: "#777" }}
                >
                  You can leave this blank if you shared the situation aloud.
                </p>

                <button
                  onClick={() => setSituationSharedAloud(!situationSharedAloud)}
                  style={{
                    marginTop: "16px",
                    padding: "12px 18px",
                    borderRadius: "999px",
                    border: situationSharedAloud
                      ? "2px solid #0f766e"
                      : "2px solid #d8d2c4",
                    background: situationSharedAloud ? "#ccfbf1" : "#fffdf8",
                    color: situationSharedAloud ? "#115e59" : "#52606d",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {situationSharedAloud
                    ? "✓ Shared aloud"
                    : "I shared this aloud"}
                </button>
              </div>

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(0)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                <button
                  onClick={() => {
                    if (situationIsComplete) setCurrentStep(2);
                  }}
                  disabled={!situationIsComplete}
                  style={{
                    ...primaryButtonStyle,
                    opacity: situationIsComplete ? 1 : 0.4,
                    cursor: situationIsComplete ? "pointer" : "not-allowed",
                  }}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 2 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 3 — Belief
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                What story are you telling yourself about what happened?
              </p>

              <CardGrid
  cardsToShow={beliefCards}
 selectedId={selectedBelief}
                onSelect={(id) => {
                  setSelectedBelief(id);
                  if (id !== BELIEF_WILD_CARD_ID) {
                    setCustomBelief("");
                  }
                }}
                cardButtonStyle={cardButtonStyle}
              />

              {selectedBelief === BELIEF_WILD_CARD_ID && (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "24px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.72)",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Name your own belief</h3>

                  <textarea
                    placeholder="What story are you telling yourself?"
                    value={customBelief}
                    onChange={(e) => setCustomBelief(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "18px",
                      borderRadius: "18px",
                      border: "2px solid #d8d2c4",
                      fontSize: "17px",
                      resize: "vertical",
                      background: "#fffdf8",
                    }}
                  />
                </div>
              )}

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                {beliefIsComplete && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    style={primaryButtonStyle}
                  >
                    Continue
                  </button>
                )}
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 3 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 4 — Declare the Emotion Timeline
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                Read the emotion timeline aloud.
              </p>

              <div
                style={{
                  marginTop: "28px",
                  padding: "34px",
                  borderRadius: "28px",
                  background: "#fffdf8",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  fontSize: "28px",
                  lineHeight: "1.55",
                }}
              >
                <span style={{ color: "#777" }}>When </span>
                <strong>{situationText || "[the situation happened]"}</strong>
                <span style={{ color: "#777" }}> , I told myself </span>
                <strong>{singleBeliefText}</strong>
                <span style={{ color: "#777" }}> , so I felt </span>
                <strong>{singleEmotionText}</strong>
                <span>.</span>
              </div>

              <button
                onClick={() => setTimelineDeclared(!timelineDeclared)}
                style={{
                  marginTop: "24px",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  border: timelineDeclared
                    ? "2px solid #0f766e"
                    : "2px solid #d8d2c4",
                  background: timelineDeclared ? "#ccfbf1" : "#fffdf8",
                  color: timelineDeclared ? "#115e59" : "#52606d",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {timelineDeclared
                  ? "✓ Emotion timeline declared"
                  : "I have declared this aloud"}
              </button>

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                <button
                  onClick={() => {
                    if (timelineIsComplete) setCurrentStep(4);
                  }}
                  disabled={!timelineIsComplete}
                  style={{
                    ...primaryButtonStyle,
                    opacity: timelineIsComplete ? 1 : 0.4,
                    cursor: timelineIsComplete ? "pointer" : "not-allowed",
                  }}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 4 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 5 — Response
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                What is one response you are willing to try?
              </p>

              <CardGrid
                cardsToShow={responseCards}
                selectedId={selectedResponse}
                onSelect={(id) => {
                  setSelectedResponse(id);
                  if (id !== RESPONSE_WILD_CARD_ID) {
                    setCustomResponse("");
                  }
                }}
                cardButtonStyle={cardButtonStyle}
              />

              {selectedResponse === RESPONSE_WILD_CARD_ID && (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "24px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.72)",
                    maxWidth: "760px",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Name your own response</h3>

                  <textarea
                    placeholder="What response are you willing to try?"
                    value={customResponse}
                    onChange={(e) => setCustomResponse(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "18px",
                      borderRadius: "18px",
                      border: "2px solid #d8d2c4",
                      fontSize: "17px",
                      resize: "vertical",
                      background: "#fffdf8",
                    }}
                  />
                </div>
              )}

              {responseCardIsComplete && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "26px",
                    borderRadius: "24px",
                    background: "#fffdf8",
                    maxWidth: "760px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "18px", color: "#52606d" }}>
                    Your chosen response:
                  </p>

                  <p
                    style={{
                      marginTop: "10px",
                      marginBottom: 0,
                      fontSize: "32px",
                      fontWeight: "bold",
                    }}
                  >
                    {singleResponseText}
                  </p>

                  <div style={{ marginTop: "28px" }}>
                    <p
                      style={{
                        fontSize: "18px",
                        color: "#52606d",
                        lineHeight: 1.6,
                      }}
                    >
                      You may type about this response, or simply share it
                      aloud.
                    </p>

                    <textarea
                      placeholder="Optional: What draws you to this response?"
                      value={responseReflection}
                      onChange={(e) => setResponseReflection(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "140px",
                        marginTop: "14px",
                        padding: "18px",
                        borderRadius: "18px",
                        border: "2px solid #d8d2c4",
                        fontSize: "17px",
                        resize: "vertical",
                        background: "#fffdf8",
                      }}
                    />

                    <button
                      onClick={() =>
                        setResponseSharedAloud(!responseSharedAloud)
                      }
                      style={{
                        marginTop: "18px",
                        padding: "12px 18px",
                        borderRadius: "999px",
                        border: responseSharedAloud
                          ? "2px solid #0f766e"
                          : "2px solid #d8d2c4",
                        background: responseSharedAloud ? "#ccfbf1" : "#fffdf8",
                        color: responseSharedAloud ? "#115e59" : "#52606d",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      {responseSharedAloud
                        ? "✓ Shared aloud"
                        : "I shared this aloud"}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                {responseIsComplete && (
                  <button
                    onClick={() => setLevel1Complete(true)}
                    style={primaryButtonStyle}
                  >
                    Complete Level 1
                  </button>
                )}
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 5 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 6 — Alternative Beliefs
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                Pick up to two alternative beliefs that could also explain the
                situation. These are not advice. They are possible lenses.
              </p>

              <CardGrid
                cardsToShow={beliefCards.filter(
                  (card) => card.id !== selectedBelief,
                )}
                selectedIds={alternativeBeliefs}
                onSelect={(id) => {
                  if (alternativeBeliefs.includes(id)) {
                    setAlternativeBeliefs(
                      alternativeBeliefs.filter((beliefId) => beliefId !== id),
                    );
                  } else if (alternativeBeliefs.length < 2) {
                    setAlternativeBeliefs([...alternativeBeliefs, id]);
                  }
                }}
                cardButtonStyle={cardButtonStyle}
              />

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(4)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                {alternativeBeliefs.length > 0 && (
                  <button
                    onClick={() => {
                      setFinalBelief(selectedBelief);
                      setFinalEmotion(selectedEmotion);
                      setCustomFinalEmotion(
                        selectedEmotion === EMOTION_WILD_CARD_ID
                          ? customEmotion
                          : "",
                      );
                      setTimelineRedeclared(false);
                      setCurrentStep(6);
                    }}
                    style={primaryButtonStyle}
                  >
                    Continue
                  </button>
                )}
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 6 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 7 — Meaning-Making
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                You may keep your original belief, change it, or choose one of
                the alternative beliefs. Notice which belief feels most true,
                and which one feels most helpful.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "24px",
                  marginTop: "28px",
                }}
              >
                {[selectedBelief, ...alternativeBeliefs]
                  .filter(Boolean)
                  .map((beliefId) => {
                    const card = beliefCards.find(
                      (belief) => belief.id === beliefId,
                    );

                    if (!card) return null;

                    return (
                      <button
                        key={card.id}
                        onClick={() => setFinalBelief(card.id)}
                        style={cardButtonStyle(finalBelief === card.id)}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: "100%", display: "block" }}
                        />

                        {card.id === "belief_wild_card" &&
                          customBelief.trim().length > 0 && (
                            <div
                              style={{
                                padding: "14px",
                                fontSize: "15px",
                                lineHeight: 1.4,
                                fontWeight: "bold",
                                color: "#115e59",
                                background: "#ccfbf1",
                                textAlign: "left",
                              }}
                            >
                              <strong>You wrote:</strong>
                              <br />“{customBelief}”
                            </div>
                          )}
                      </button>
                    );
                  })}
              </div>

              {finalBelief && (
                <>
                  <h3 style={{ marginTop: "36px", fontSize: "24px" }}>
                    What emotion feels true now?
                  </h3>

                  <p style={{ fontSize: "17px", color: "#52606d" }}>
                    The emotion may change, soften, intensify, or stay the same.
                  </p>

                  <CardGrid
                    cardsToShow={emotionCards}
                    selectedId={finalEmotion}
                    onSelect={(id) => {
                      setFinalEmotion(id);
                      if (id !== EMOTION_WILD_CARD_ID) {
                        setCustomFinalEmotion("");
                      }
                    }}
                    cardButtonStyle={cardButtonStyle}
                  />

                  {finalEmotion === EMOTION_WILD_CARD_ID && (
                    <div
                      style={{
                        marginTop: "28px",
                        padding: "24px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.72)",
                      }}
                    >
                      <h3 style={{ marginTop: 0 }}>
                        Name your current emotion
                      </h3>

                      <textarea
                        placeholder="What emotion feels true now?"
                        value={customFinalEmotion}
                        onChange={(e) => setCustomFinalEmotion(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "100px",
                          padding: "18px",
                          borderRadius: "18px",
                          border: "2px solid #d8d2c4",
                          fontSize: "17px",
                          resize: "vertical",
                          background: "#fffdf8",
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {finalBelief && finalEmotionIsComplete && (
                <>
                  <div
                    style={{
                      marginTop: "32px",
                      padding: "30px",
                      borderRadius: "28px",
                      background: "#fffdf8",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                      fontSize: "26px",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "#777" }}>When </span>
                    <strong>
                      {situationText || "[the situation happened]"}
                    </strong>
                    <span style={{ color: "#777" }}> , I now tell myself </span>
                    <strong>{finalBeliefText}</strong>
                    <span style={{ color: "#777" }}> , so I feel </span>
                    <strong>{finalEmotionText}</strong>
                    <span>.</span>
                  </div>

                  <button
                    onClick={() => setTimelineRedeclared(!timelineRedeclared)}
                    style={{
                      marginTop: "24px",
                      padding: "12px 18px",
                      borderRadius: "999px",
                      border: timelineRedeclared
                        ? "2px solid #0f766e"
                        : "2px solid #d8d2c4",
                      background: timelineRedeclared ? "#ccfbf1" : "#fffdf8",
                      color: timelineRedeclared ? "#115e59" : "#52606d",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {timelineRedeclared
                      ? "✓ Emotion timeline redeclared"
                      : "I have redeclared this aloud"}
                  </button>
                </>
              )}

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(5)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                {finalBelief &&
                  finalEmotionIsComplete &&
                  timelineRedeclared && (
                    <button
                      onClick={() => {
                        setFinalResponse(selectedResponse);
                        setCustomFinalResponse(
                          selectedResponse === RESPONSE_WILD_CARD_ID
                            ? customResponse
                            : "",
                        );
                        setCurrentStep(7);
                      }}
                      style={primaryButtonStyle}
                    >
                      Continue
                    </button>
                  )}
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 7 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 8 — Final Response
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                After considering other beliefs, do you want to keep your
                response or choose a new one?
              </p>

              <CardGrid
                cardsToShow={responseCards}
                selectedId={finalResponse}
                onSelect={(id) => {
                  setFinalResponse(id);
                  if (id !== RESPONSE_WILD_CARD_ID) {
                    setCustomFinalResponse("");
                  }
                }}
                cardButtonStyle={cardButtonStyle}
              />

              {finalResponse === RESPONSE_WILD_CARD_ID && (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "24px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.72)",
                    maxWidth: "760px",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Name your final response</h3>

                  <textarea
                    placeholder="What response do you choose now?"
                    value={customFinalResponse}
                    onChange={(e) => setCustomFinalResponse(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "18px",
                      borderRadius: "18px",
                      border: "2px solid #d8d2c4",
                      fontSize: "17px",
                      resize: "vertical",
                      background: "#fffdf8",
                    }}
                  />
                </div>
              )}

              {finalResponseIsComplete && (
                <div
                  style={{
                    marginTop: "32px",
                    padding: "32px",
                    borderRadius: "28px",
                    background: "#fffdf8",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <p
                    style={{
                      marginTop: 0,
                      fontSize: "18px",
                      color: "#52606d",
                    }}
                  >
                    Final response:
                  </p>

                  <p
                    style={{
                      fontSize: "34px",
                      fontWeight: "bold",
                      lineHeight: 1.4,
                      marginBottom: 0,
                    }}
                  >
                    {finalResponseText}
                  </p>
                </div>
              )}

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(6)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                {finalResponseIsComplete && (
                  <button
                    onClick={() => setCurrentStep(8)}
                    style={primaryButtonStyle}
                  >
                    Continue
                  </button>
                )}
              </div>
            </>
          )}

          {!showClosingScreen && !level1Complete && currentStep === 8 && (
            <>
              <h2 style={{ fontSize: "30px", marginTop: 0 }}>
                Step 9 — Reflection
              </h2>

              <p style={{ fontSize: "19px", color: "#52606d" }}>
                Take a moment to notice what shifted, what stayed, and what
                opened up.
              </p>

              <div
                style={{
                  marginTop: "28px",
                  display: "grid",
                  gap: "18px",
                  maxWidth: "850px",
                }}
              >
                {[
                  "What did you notice about your beliefs?",
                  "Which belief felt most true, and which belief felt most helpful?",
                  "What was it like receiving or considering alternative beliefs?",
                  "What opened up for you that was not there before?",
                ].map((question) => (
                  <div
                    key={question}
                    style={{
                      padding: "24px",
                      borderRadius: "24px",
                      background: "#fffdf8",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                      fontSize: "21px",
                      lineHeight: 1.5,
                      fontWeight: "bold",
                    }}
                  >
                    {question}
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "32px",
                  padding: "30px",
                  borderRadius: "28px",
                  background: "rgba(255,255,255,0.75)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  maxWidth: "850px",
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: "24px" }}>
                  Your final emotion timeline
                </h3>

                <p style={{ fontSize: "24px", lineHeight: 1.6 }}>
                  When{" "}
                  <strong>{situationText || "[the situation happened]"}</strong>
                  , I now tell myself <strong>{finalBeliefText}</strong>, so I
                  feel <strong>{finalEmotionText}</strong>. I choose to{" "}
                  <strong>{finalResponseText}</strong>.
                </p>
              </div>

              <div
                style={{
                  marginTop: "32px",
                  padding: "30px",
                  borderRadius: "28px",
                  background: "#fffdf8",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  maxWidth: "850px",
                }}
              >
                <h3 style={{ marginTop: 0, fontSize: "24px" }}>
                  Reflection Space
                </h3>

                <p
                  style={{
                    fontSize: "17px",
                    lineHeight: 1.7,
                    color: "#52606d",
                  }}
                >
                  You may write about what you noticed, or simply share it
                  aloud.
                </p>

                <textarea
                  placeholder="What are you noticing now?"
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "180px",
                    marginTop: "16px",
                    padding: "18px",
                    borderRadius: "18px",
                    border: "2px solid #d8d2c4",
                    fontSize: "17px",
                    resize: "vertical",
                    background: "#fffdf8",
                  }}
                />

                <button
                  onClick={() =>
                    setReflectionSharedAloud(!reflectionSharedAloud)
                  }
                  style={{
                    marginTop: "18px",
                    padding: "12px 18px",
                    borderRadius: "999px",
                    border: reflectionSharedAloud
                      ? "2px solid #0f766e"
                      : "2px solid #d8d2c4",
                    background: reflectionSharedAloud ? "#ccfbf1" : "#fffdf8",
                    color: reflectionSharedAloud ? "#115e59" : "#52606d",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {reflectionSharedAloud
                    ? "✓ Shared aloud"
                    : "I shared this aloud"}
                </button>
              </div>

              <div style={{ marginTop: "32px" }}>
                <button
                  onClick={() => setCurrentStep(7)}
                  style={{ ...secondaryButtonStyle, marginRight: "12px" }}
                >
                  Back
                </button>

                <button
                  onClick={() => setShowClosingScreen(true)}
                  style={primaryButtonStyle}
                >
                  Finish
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function CardGrid({
  cardsToShow,
  selectedId,
  selectedIds,
  onSelect,
  cardButtonStyle,
}: {
  cardsToShow: typeof cards;
  selectedId?: string | null;
  selectedIds?: string[];
  onSelect: (id: string) => void;
  cardButtonStyle: (isSelected: boolean) => React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "24px",
        marginTop: "28px",
      }}
    >
      {cardsToShow.map((card) => {
        const isSelected = selectedIds
          ? selectedIds.includes(card.id)
          : selectedId === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            style={cardButtonStyle(isSelected)}
          >
            <img
              src={card.image}
              alt={card.title}
              style={{
                width: "100%",
                display: "block",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function StatusList({
  title,
  players,
  done,
}: {
  title: string;
  players: string[];
  done: (index: number) => boolean;
}) {
  return (
    <div
      style={{
        marginTop: "28px",
        padding: "20px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.75)",
      }}
    >
      <h4 style={{ marginTop: 0 }}>{title}</h4>

      {players.map((player, index) => (
        <p key={player} style={{ margin: "8px 0", fontSize: "17px" }}>
          {done(index) ? "✓" : "○"} {player}
        </p>
      ))}
    </div>
  );
}
