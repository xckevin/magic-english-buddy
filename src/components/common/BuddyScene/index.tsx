/** Lightweight local vector artwork; no remote images needed offline. */
export default function BuddyScene({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 280" fill="none" aria-hidden="true">
      <circle cx="192" cy="139" r="107" fill="#DDD5F0" opacity=".65" />
      <circle cx="192" cy="139" r="82" stroke="#FAF8FF" strokeWidth="1.5" strokeDasharray="4 9" />
      <ellipse cx="188" cy="247" rx="98" ry="12" fill="#C9BDDF" opacity=".5" />
      <path d="M77 216C54 190 43 196 46 214C50 228 62 231 79 229" fill="#88AFA0" />
      <path d="M78 234C48 214 46 239 78 242M79 240C88 215 106 219 95 234" fill="#ADC6A6" />
      <path d="M294 226C308 200 325 211 309 229M294 235C312 221 326 237 300 243" fill="#9FB8A3" />
      <path d="M106 154C91 131 77 148 85 166L113 190" fill="#A793D7" />
      <path d="M247 163C265 130 282 144 268 167L244 196" fill="#A793D7" />
      <path
        d="M111 135C115 89 165 83 195 92C242 89 264 123 254 169L244 216C239 240 216 246 198 232C181 249 162 247 148 233C125 245 110 230 110 211L104 174Z"
        fill="#B5A2E0"
      />
      <path
        d="M121 167C119 138 145 117 174 119C207 116 236 137 235 167C234 204 216 224 181 225C148 225 121 207 121 167Z"
        fill="#CFC0EE"
      />
      <ellipse cx="153" cy="163" rx="6" ry="9" fill="#49366E" />
      <ellipse cx="210" cy="163" rx="6" ry="9" fill="#49366E" />
      <circle cx="155" cy="160" r="2" fill="#fff" />
      <circle cx="212" cy="160" r="2" fill="#fff" />
      <path d="M172 180Q182 191 193 179" stroke="#6F4F92" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="139" cy="180" rx="10" ry="5" fill="#ECA8BA" opacity=".8" />
      <ellipse cx="222" cy="180" rx="10" ry="5" fill="#ECA8BA" opacity=".8" />
      <path d="M136 108L162 42C167 32 176 25 186 24L196 37L210 104" fill="#7560B0" />
      <path d="M157 52L162 42C168 31 178 25 186 24L177 48Z" fill="#9581CA" />
      <path d="M126 108Q170 89 222 106L231 117Q177 131 119 119Z" fill="#6C559F" />
      <path d="M148 83L212 84L216 99Q181 89 142 101Z" fill="#F1CF80" />
      <path
        d="M184 51L187 59L195 60L189 65L190 73L183 69L176 73L178 65L172 60L180 59Z"
        fill="#F9E6A8"
      />
      <path d="M109 210Q138 199 174 217L179 250Q147 231 112 236Z" fill="#6D8B80" />
      <path d="M179 217Q211 198 244 208L242 235Q210 231 179 250Z" fill="#8EA799" />
      <path d="M117 211Q147 205 175 220L179 245Q149 229 119 232Z" fill="#FFF8E7" />
      <path d="M181 220Q210 205 239 210L236 232Q209 229 181 245Z" fill="#EEE4CD" />
      <path
        d="M126 217Q151 216 166 224M127 225Q150 224 164 231M191 224Q212 215 230 217"
        stroke="#CABC9F"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M270 72L274 84L286 88L274 92L270 105L266 92L254 88L266 84Z" fill="#DFAE55" />
      <path d="M78 98L81 106L90 109L81 112L78 121L75 112L66 109L75 106Z" fill="#AA96D3" />
      <circle cx="287" cy="149" r="4" fill="#B1A0D5" />
      <circle cx="94" cy="61" r="3" fill="#DAB773" />
      <path d="M48 151L63 141L76 164L60 174Z" fill="#FFF9E9" stroke="#D9CBAF" strokeWidth="2" />
      <path d="M55 151L66 147M59 157L69 152M63 162L71 158" stroke="#C7B58D" strokeWidth="2" />
    </svg>
  );
}
