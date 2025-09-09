import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePrev, setImagePrev] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage, addMessage } = useChatStore();
  const { authUser } = useAuthStore();

  const handleSelectedImage = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePrev(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setImagePrev(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePrev) return;
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePrev,
      });

      //clear form after submit
      setText("");
      setImagePrev(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.log("Failed to send message:", error);
    }
  };

  //What is the capital of the United States? New York, Washington, New Jersey, California
  // https://narendra07.app.n8n.cloud/webhook-test/poll
  // http://localhost:5678/webhook/poll
  // const handleSendPoll = async (prompt) => {
  //   try {
  //     // Split user input into question and options
  //     let question = prompt;
  //     let options = [];

  //     // Detect options after the question (comma-separated)
  //     const parts = prompt.split("?");
  //     if (parts.length > 1) {
  //       question = parts[0].trim() + "?";
  //       options = parts[1]
  //         .split(",")
  //         .map((opt) => opt.trim())
  //         .filter(Boolean);
  //     }

  //     // Prepare payload for Gemini
  //     const geminiPrompt = options.length
  //       ? `Create a poll in strict JSON format using the exact question below. Use these options exactly: ${JSON.stringify(
  //           options
  //         )}. Return ONLY valid JSON with this structure: {"question":"<poll question>","options":["option1","option2","option3","option4"]}\nQuestion: ${question}`
  //       : `Create a poll in strict JSON format using the exact question below. Generate up to 4 reasonable options. Return ONLY valid JSON with this structure: {"question":"<poll question>","options":["option1","option2","option3","option4"]}\nQuestion: ${question}`;

  //     const res = await fetch("http://localhost:5678/webhook/poll", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ prompt: geminiPrompt }),
  //     });

  //     const data = await res.json();

  //     let pollMessage = { question, options: options.length ? options : [] };

  //     try {
  //       const text = data.poll?.content?.parts?.[0]?.text;
  //       if (text) {
  //         const cleanedText = text
  //           .replace(/```json/g, "")
  //           .replace(/```/g, "")
  //           .trim();
  //         const parsed = JSON.parse(cleanedText);

  //         // Use Gemini options if available, else use extracted options
  //         pollMessage = {
  //           question,
  //           options:
  //             parsed.options && parsed.options.length > 0
  //               ? parsed.options
  //               : options.length
  //               ? options
  //               : ["Option 1", "Option 2", "Option 3", "Option 4"],
  //         };
  //       }
  //     } catch (err) {
  //       console.error("Failed to parse poll JSON:", err);
  //       // Fallback
  //       pollMessage = {
  //         question,
  //         options: options.length
  //           ? options
  //           : ["Option 1", "Option 2", "Option 3", "Option 4"],
  //       };
  //     }

  //     // Inject poll message into chat
  //     addMessage({
  //       _id: Date.now(),
  //       type: "poll",
  //       poll: pollMessage,
  //       senderId: authUser._id,
  //       createdAt: new Date(),
  //     });

  //     setText(""); // clear input
  //   } catch (err) {
  //     console.error("Error creating poll:", err);
  //   }
  // };

  const handleSendPoll = async (prompt) => {
    try {
      // Split user input into question and options
      let question = prompt;
      let options = [];

      // Detect options after the question (comma-separated)
      const parts = prompt.split("?");
      if (parts.length > 1) {
        question = parts[0].trim() + "?";
        options = parts[1]
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean);
      }

      // Prepare payload for Gemini
      let geminiPrompt = "";

      if (options.length) {
        // Send the options explicitly so Gemini just formats them
        geminiPrompt = `Create a poll in strict JSON format using the exact question below. Use these options exactly: ${JSON.stringify(
          options
        )}. Return ONLY valid JSON with this structure:
{
  "question": "<poll question>",
  "options": ["option1","option2","option3","option4"]
}
Question: ${question}`;
      } else {
        // Let Gemini generate options only if not provided
        geminiPrompt = `Create a poll in strict JSON format using the exact question below. Generate up to 4 reasonable options. Return ONLY valid JSON with this structure:
{
  "question": "<poll question>",
  "options": ["option1","option2","option3","option4"]
}
Question: ${question}`;
      }

      const res = await fetch(
        "https://narendra07.app.n8n.cloud/webhook/poll",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: geminiPrompt }),
        }
      );

      const data = await res.json();

      let pollMessage = { question, options: options.length ? options : [] };

      try {
        const text = data.poll?.content?.parts?.[0]?.text;
        if (text) {
          const cleanedText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          const parsed = JSON.parse(cleanedText);

          // Use Gemini options only if no frontend options provided
          pollMessage = {
            question,
            options: options.length
              ? options
              : parsed.options && parsed.options.length > 0
              ? parsed.options
              : ["Option 1", "Option 2", "Option 3", "Option 4"],
          };
        }
      } catch (err) {
        console.error("Failed to parse poll JSON:", err);
        pollMessage = {
          question,
          options: options.length
            ? options
            : ["Option 1", "Option 2", "Option 3", "Option 4"],
        };
      }

      addMessage({
        _id: Date.now(),
        type: "poll",
        poll: pollMessage,
        senderId: authUser._id,
        createdAt: new Date(),
      });

      setText("");
    } catch (err) {
      console.error("Error creating poll:", err);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePrev && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePrev}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border-zinc-700"
            />
            <button
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
              onClick={removeSelectedImage}
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleSelectedImage}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePrev ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !imagePrev}
          className="btn btn-sm btn-circle"
        >
          <Send size={22} />
        </button>

        {/* ✅ Optional Poll Button */}
        <button
          type="button"
          onClick={() => handleSendPoll(text)}
          disabled={!text.trim()}
          className="btn btn-sm btn-circle bg-green-500 text-white"
        >
          Poll
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
