import os
from dotenv import load_dotenv
load_dotenv('.env')

from google import genai
from google.genai import types

prompt = "Generate a solid 3D cylinder shaft coupler with an outer diameter of 50mm and a length of 70mm. Add a central stepped bore through-hole along the main axis: the first section is 30mm long with a 15mm diameter, and the second section is 40mm long with a 20mm diameter. On the outer surface, cut a flat keyway flat that is 10mm wide and 2mm deep running parallel to the central axis for the entire 70mm length. Chamfer all outer circular rims by 1mm at 45 degrees."

import sys
sys.path.append(os.path.abspath('.'))
sys.path.append(os.path.abspath('./CADSmith'))
from CADSmith.autofab.agents import PLANNER_SYSTEM, _generation_model

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

model = _generation_model()
print(f"MODEL: {model}")

contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]

response = client.models.generate_content(
    model=model,
    contents=contents,
    config=types.GenerateContentConfig(
        system_instruction=PLANNER_SYSTEM,
        max_output_tokens=8192,
    ),
)

print(f"FINISH REASON: {response.candidates[0].finish_reason}")
print(f"TOKEN COUNT IN: {response.usage_metadata.prompt_token_count if response.usage_metadata else 'N/A'}")
print(f"TOKEN COUNT OUT: {response.usage_metadata.candidates_token_count if response.usage_metadata else 'N/A'}")
print("--- TEXT ---")
print(response.text)

