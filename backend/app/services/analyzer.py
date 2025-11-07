from functools import lru_cache
from typing import Dict

from transformers import pipeline

from ..config import get_settings

settings = get_settings()


class ContractAnalyzer:
    """Executa análise automática de contratos usando modelos open-source."""

    def __init__(self) -> None:
        self._summary_pipeline = pipeline(
            task="summarization",
            model=settings.summary_model,
            framework="pt"
        )
        self._review_pipeline = pipeline(
            task="text2text-generation",
            model=settings.review_model,
            framework="pt"
        )

    def analyze(self, text: str) -> Dict[str, str]:
        summary = self._generate_summary(text)
        review = self._generate_review(text)
        issues = self._generate_issues(text)
        suggestions = self._generate_suggestions(text)
        return {
            "summary": summary,
            "review": review,
            "issues": issues,
            "suggestions": suggestions,
        }

    def _generate_summary(self, text: str) -> str:
        result = self._summary_pipeline(
            text,
            max_length=settings.max_summary_tokens,
            min_length=60,
            do_sample=False,
        )
        return result[0]["summary_text"].strip()

    def _generate_review(self, text: str) -> str:
        prompt = (
            "Você é um analista jurídico. Forneça uma revisão geral em português "
            "do contrato a seguir, destacando pontos fortes, riscos e possíveis ambiguidades.\n\n"
            f"Contrato:\n{text}"
        )
        result = self._review_pipeline(
            prompt,
            max_length=settings.max_review_tokens,
            do_sample=False,
        )
        return result[0]["generated_text"].strip()

    def _generate_issues(self, text: str) -> str:
        prompt = (
            "Liste em tópicos as principais falhas, lacunas ou cláusulas ausentes "
            "no contrato abaixo, considerando boas práticas de governança e compliance.\n\n"
            f"Contrato:\n{text}"
        )
        result = self._review_pipeline(
            prompt,
            max_length=settings.max_review_tokens,
            do_sample=False,
        )
        return result[0]["generated_text"].strip()

    def _generate_suggestions(self, text: str) -> str:
        prompt = (
            "Sugira alterações objetivas e cláusulas adicionais para tornar o contrato "
            "alinhado às normas de compliance e reduzir riscos.\n\n"
            f"Contrato:\n{text}"
        )
        result = self._review_pipeline(
            prompt,
            max_length=settings.max_review_tokens,
            do_sample=False,
        )
        return result[0]["generated_text"].strip()


@lru_cache(maxsize=1)
def get_analyzer() -> ContractAnalyzer:
    return ContractAnalyzer()
