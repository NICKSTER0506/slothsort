# 🦥 SlothSort — Slow and Steady Autonomous File Tidier

> *"Channel your inner sloth. Let open-source AI clean your digital clutter while you conserve energy."*
> 
> Built for **International Sloth Day** and the **Dev.to Open-Source AI Challenge: Slow and Steady**.

---

## 🌟 The Philosophy

Sloths are the zen masters of nature: they move at their own deliberate pace (0.15 mph), avoid unnecessary exertion, and conserve their precious energy. 

Yet as developers and computer users, we constantly dread the chaotic mess in our `Downloads` and `Desktop` folders:
- `Screenshot_2024-10-19_at_03.14.22_AM.png`
- `INV_9921_october_stripe_final(1).pdf`
- `docker-compose.prod.v2.backup.yml`
- Random receipts, tax docs, memes, and executables piling up for months.

Organizing them manually requires mental energy we'd rather spend taking a nap.

**SlothSort** is an autonomous desktop janitor that runs quietly on your machine. Using local, open-source AI, it reads your files, semantically categorizes them into tidy folders, cleans up erratic filenames into clean kebab-case, and leaves a gentle report of the energy you conserved.

---

## 🛡️ Why Open Innovation Matters Here

1. **Absolute Privacy:** Your `Downloads` folder contains bank statements, health tax forms, signed contracts, and private photos. Uploading these to cloud APIs (like OpenAI) is a major privacy violation. Open-weight models run **100% on-device**—not a single byte leaves your computer.
2. **$0 Forever:** Zero API subscriptions, token charges, or surprise bills.
3. **Works 100% Offline:** Runs on an airplane, in a cabin, or during a Wi-Fi outage.
4. **Model Freedom:** Plug-and-play with your favorite open-weight model via Ollama (`llama3.2`, `qwen2.5`, `smollm2`, `mistral`) or use the built-in local semantic engine with zero configuration.

---

## 🚀 Quick Start (Under 1 Minute)

### 1. Run the CLI Organizer
```bash
# Preview what SlothSort will do (safe dry-run)
npm run sort
# or: node slothsort.js ./test-messy-folder

# Execute for real
npm run sort:apply
# or: node slothsort.js ./test-messy-folder --apply
```

### 2. Launch the Cute Sloth Dashboard
```bash
npm start
# or: node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧩 Supported Open AI Backends

- **Ollama (Local Open-Weight Models):** If you run Ollama (`ollama run llama3.2` or `qwen2.5`), SlothSort automatically detects and connects to it at `http://localhost:11434`.
- **Standalone Local Semantic Engine:** If Ollama is not running, SlothSort gracefully falls back to its built-in open semantic parser. No downloads or setup required!

---

## 📜 License
MIT — Conserve your energy. Go take a nap! 🦥💤
