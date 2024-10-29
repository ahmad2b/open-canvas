export const GENERATE_THREAD_TITLE_PROMPT = `You are an expert assistant tasked with generating an extremely short title for a conversation thread. The title should be concise and capture the essence of the conversation or the generated artifact. Ensure the title is short enough to never require truncation.

Here is the user's message:
{user_message}

Here is the generated artifact (if any):
<artifact>
{artifact}
</artifact>

Here is the response to the user's message (or just the response if no artifact was generated):
{response}

Your job is to create a title that succinctly represents the content and context of the conversation or artifact. The title should be clear, descriptive, and as short as possible.`;
