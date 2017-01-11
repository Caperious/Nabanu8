Najprej je potrebno inštalirati node.js.
Z cmd-jem se premaknete v folder kjer je projekt
Poženeš ukaz npm install, da ti inštalera vse kar je potrebno iz datoteke package.json
(Opcijsko) Jst sm si inštalerou še nodemon, inštaleraš ga z npm install -g nodemon, tu je da gleda spremembe v fajlih k jih urejaš, in ti sam avtomatsko restarta server, da ti ga ni treba usakiè posebej sam na roke.
potem pa poženeš nodemon index.js in to je to
V brskalnik vnesite lokalni ip na portu 3000 (primer: 192.168.63.1:3000)