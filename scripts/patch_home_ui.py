from pathlib import Path
p = Path('/home/ubuntu/truefix/client/src/pages/Home.tsx')
s = p.read_text()
old = '<label className="mb-2 block text-xs font-extrabold text-[#122131]">Tell us what happened</label><input ref={audioInputRef}'
new = '<label className="mb-2 block text-xs font-extrabold text-[#122131]">Tell us what happened</label><textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="Example: The garbage has been here since Monday, blocking the college gate." className="mb-2 min-h-[76px] w-full resize-none rounded-2xl border border-[#d8ddd4] bg-white p-4 text-sm text-[#122131] outline-none placeholder:text-[#9aa59d] focus:border-[#a5bd43]" /><input ref={audioInputRef}'
assert old in s
s = s.replace(old, new, 1)
s = s.replace('Photos and voice notes are uploaded to the project storage layer only when you submit.', 'Photos and voice notes upload immediately so you can see a real preview and catch errors before submitting.', 1)
s = s.replace('value={transcript} onChange={event => setTranscript(event.target.value)}', 'value={transcript || description} onChange={event => setTranscript(event.target.value)}', 1)
s = s.replace('<p className="mt-3 text-[13px] leading-6 text-[#b7c5c1]">ಮೂರು ದಿನಗಳಿಂದ ಕಾಲೇಜು ಗೇಟ್ ಬಳಿ ದೊಡ್ಡ ಪ್ರಮಾಣದಲ್ಲಿ ಕಸ ಸಂಗ್ರಹವಾಗಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.</p>', '<p className="mt-3 text-[13px] leading-6 text-[#b7c5c1]">{category === "Pothole" ? "ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ತಕ್ಷಣ ದುರಸ್ತಿ ಮಾಡಿ." : "ನೀವು ನೀಡಿದ ವಿವರಣೆಯ ಆಧಾರದ ಮೇಲೆ ಈ ದೂರು ರಚಿಸಲಾಗುತ್ತದೆ. ದಯವಿಟ್ಟು ಕಳುಹಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ."}</p>', 1)
s = s.replace('disabled={!photoUrl || !audioUrl} onClick={() => setStep(2)}', 'disabled={uploading || !photoStorageUrl || (!audioStorageUrl && !description.trim())} onClick={() => { setTranscript(description.trim()); setStep(2); }}', 1)
s = s.replace('disabled={createReport.isPending} onClick={() => void submit()}', 'disabled={createReport.isPending || uploading || !photoStorageUrl} onClick={() => void submit()}', 1)
s = s.replace('{createReport.isPending ? "Saving report…" : "Confirm & submit"}', '{uploading ? "Uploading media…" : createReport.isPending ? "Saving report…" : "Confirm & submit"}', 1)
p.write_text(s)
PY
python3 /home/ubuntu/truefix/scripts/patch_home_ui.py
rm /home/ubuntu/truefix/scripts/patch_home_ui.py
