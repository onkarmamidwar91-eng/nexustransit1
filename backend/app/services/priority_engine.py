"""
Priority engine.

Turns (issue_type, confidence, observation_count) into a (priority,
priority_score, reason) triple. This is a simple, explainable rule set —
not a trained model — deliberately, so the logic is easy to demo and
defend in front of judges.
"""

BASE_PRIORITY = {
    "POTHOLE": ("HIGH", 70),
    "GARBAGE": ("MEDIUM", 45),
    "WATERLOGGING": ("HIGH", 75),
    "OBSTRUCTION": ("HIGH", 70),
    "STREETLIGHT": ("MEDIUM", 40),
    "OTHER": ("LOW", 25),
}


def _score_to_priority(score: int) -> str:
    if score >= 85:
        return "CRITICAL"
    if score >= 65:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def calculate_priority(issue_type: str, confidence: float, observation_count: int = 1):
    base_label, score = BASE_PRIORITY.get(issue_type, ("LOW", 25))
    reasons = [f"Base priority for {issue_type.title()} is {base_label}."]

    # Confidence adjustment
    if confidence >= 0.85:
        score += 10
        reasons.append("High-confidence detection.")
    elif confidence < 0.5:
        score -= 15
        reasons.append("Low-confidence detection reduced priority.")

    # Repeated observation (multiple buses / multiple passes) raises urgency
    if observation_count >= 3:
        score += 20
        reasons.append(f"Confirmed by {observation_count} repeated observations.")
    elif observation_count == 2:
        score += 10
        reasons.append("Confirmed by a second observation.")

    score = max(0, min(100, score))
    priority = _score_to_priority(score)
    reason = " ".join(reasons)
    return priority, score, reason
