# Download Porcupine Model Files

This script helps you download the required Porcupine model files.

## Option 1: Manual Download

1. Go to: https://github.com/Picovoice/porcupine/tree/master/lib/common
2. Download `porcupine_params.pv`
3. Place it in the `public/` folder

## Option 2: Using curl (if available)

```bash
cd public
curl -O https://raw.githubusercontent.com/Picovoice/porcupine/master/lib/common/porcupine_params.pv
```

## Option 3: Using PowerShell

```powershell
cd public
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Picovoice/porcupine/master/lib/common/porcupine_params.pv" -OutFile "porcupine_params.pv"
```

After downloading, your `public/` folder should have:
- Hey-Kitchen_en_wasm_v3_0_0.ppn (your custom wake word) ✓
- porcupine_params.pv (model parameters) - NEEDED
