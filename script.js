const fetchSavedPrompts = async () => {
    try {
        const response = await fetch("/view-prompts");
        if (!response.ok) throw new Error("Failed to fetch prompts");
        const prompts = await response.json();
        renderSavedPrompts(prompts);
    } catch (error) {
        console.error("Error fetching prompts:", error);
    }
};

const renderSavedPrompts = (prompts) => {
    const promptList = document.getElementById("prompt-list");
    promptList.innerHTML = prompts.map(prompt => `
        <li>
            <div onclick="showPrompt('${prompt.prompt_text}', '${prompt.image_url}')">${prompt.prompt_text}</div>
            <button class="close-prompt-btn" onclick="deletePrompt(${prompt.id})">&times;</button>
        </li>
    `).join("");
};

const showPrompt = (promptText, imageUrl) => {
    document.getElementById("prompt").value = promptText;
    document.getElementById("generated-image").src = imageUrl;
    document.getElementById("prompt-text").textContent = promptText;
    document.getElementById("image-modal").style.display = "block";
};

const deletePrompt = async (promptId) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
        try {
            const response = await fetch(`/delete-prompt/${promptId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete prompt");
            const result = await response.json();
            alert(result.message);
            fetchSavedPrompts();
        } catch (error) {
            console.error("Error deleting prompt:", error);
            alert(`Failed to delete prompt: ${error.message}`);
        }
    }
};

const removeAllPrompts = async () => {
    if (confirm("Are you sure you want to delete all prompts?")) {
        try {
            const response = await fetch("/delete-all-prompts", { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete all prompts");
            const result = await response.json();
            alert(result.message);
            fetchSavedPrompts();
        } catch (error) {
            console.error("Error deleting all prompts:", error);
            alert(`Failed to delete all prompts: ${error.message}`);
        }
    }
};

const closeImage = () => {
    document.getElementById("image-modal").style.display = "none";
};

document.getElementById("image-form").onsubmit = async (event) => {
    event.preventDefault();
    const promptText = document.getElementById("prompt").value.trim();
    if (!promptText) return;

    document.getElementById("loading").style.display = "block";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: promptText }),
        });

        if (!response.ok) throw new Error("Failed to generate image");
        const data = await response.json();
        showPrompt(promptText, data.image_url);
        fetchSavedPrompts();
    } catch (error) {
        console.error("Error generating image:", error);
        alert("Failed to generate image. Please try again.");
    } finally {
        document.getElementById("loading").style.display = "none";
    }
};

fetchSavedPrompts();