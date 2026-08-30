from pydantic import BaseModel, ConfigDict, Field

class CreateAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")
    questionnaireVersion: str

class Response(BaseModel):
    model_config = ConfigDict(extra="forbid")
    questionId: str
    optionId: str

class SubmitResponses(BaseModel):
    model_config = ConfigDict(extra="forbid")
    responses: list[Response] = Field(min_length=1)
