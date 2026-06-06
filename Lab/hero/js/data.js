'use strict';

const MEMBERS = [
  { id: 'felix', name: 'Felix W.', deptLabel: 'Game Development', src: 'assets/members/01.webp', size: '1x1' },
  { id: 'omar', name: 'Omar H.', deptLabel: 'Writing', src: 'assets/members/02.webp', size: '1x1' },
  { id: 'darius', name: 'Darius O.', deptLabel: 'Game Art', src: 'assets/members/03.webp', size: '1x1' },
  { id: 'sara', name: 'Sara M.', deptLabel: 'Game Art', src: 'assets/members/04.webp', size: '1x1' },
  { id: 'diana', name: 'Diana R.', deptLabel: 'Human Resources', src: 'assets/members/05.webp', size: '1x1' },
  { id: 'ivan', name: 'Ivan V.', deptLabel: 'Game Development', src: 'assets/members/06.webp', size: '1x1' },
  { id: 'ahmed', name: 'Ahmed K.', deptLabel: 'Game Development', src: 'assets/members/07.webp', size: '1x1' },
  { id: 'nour', name: 'Nour A.', deptLabel: 'Media', src: 'assets/members/08.webp', size: '1x1' },
  { id: 'lena', name: 'Lena P.', deptLabel: 'Game Art', src: 'assets/members/09.webp', size: '1x1' },
  { id: 'yusuf', name: 'Yusuf B.', deptLabel: 'Game Development', src: 'assets/members/10.webp', size: '1x1' },
  { id: 'kai', name: 'Kai T.', deptLabel: 'Management', src: 'assets/members/11.webp', size: '1x1' },
  { id: 'reem', name: 'Reem F.', deptLabel: 'Writing', src: 'assets/members/12.webp', size: '1x1' },
  { id: 'miles', name: 'Miles C.', deptLabel: 'Game Development', src: 'assets/members/13.webp', size: '1x1' },
  { id: 'priya', name: 'Priya S.', deptLabel: 'Game Art', src: 'assets/members/14.webp', size: '1x1' },
  { id: 'tobias', name: 'Tobias N.', deptLabel: 'Media', src: 'assets/members/15.webp', size: '1x1' },
  { id: 'aisha', name: 'Aisha D.', deptLabel: 'Human Resources', src: 'assets/members/16.webp', size: '1x1' },
  { id: 'yara', name: 'Yara Q.', deptLabel: 'Game Art', src: 'assets/members/17.webp', size: '1x1' },
  { id: 'chen', name: 'Chen L.', deptLabel: 'Management', src: 'assets/members/18.webp', size: '1x1' },
  { id: 'amara', name: 'Amara J.', deptLabel: 'Writing', src: 'assets/members/19.webp', size: '1x1' },
  { id: 'luna', name: 'Luna E.', deptLabel: 'Media', src: 'assets/members/20.webp', size: '1x1' },
  { id: 'tariq', name: 'Tariq M.', deptLabel: 'Game Development', src: 'assets/members/21.webp', size: '1x1' },
  { id: 'hanna', name: 'Hanna S.', deptLabel: 'Game Art', src: 'assets/members/22.webp', size: '2x1' },
  { id: 'zain', name: 'Zain B.', deptLabel: 'Writing', src: 'assets/members/23.webp', size: '1x1' },
  { id: 'mira', name: 'Mira F.', deptLabel: 'Media', src: 'assets/members/24.webp', size: '1x1' },
  { id: 'rashid', name: 'Rashid K.', deptLabel: 'Human Resources', src: 'assets/members/25.webp', size: '1x1' },
  { id: 'sophie', name: 'Sophie L.', deptLabel: 'Management', src: 'assets/members/26.webp', size: '1x2' },
  { id: 'malik', name: 'Malik R.', deptLabel: 'Game Development', src: 'assets/members/27.webp', size: '1x1' },
  { id: 'inaya', name: 'Inaya Z.', deptLabel: 'Game Art', src: 'assets/members/28.webp', size: '1x1' },
  { id: 'khalid', name: 'Khalid O.', deptLabel: 'Writing', src: 'assets/members/29.webp', size: '2x1' },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hashStringToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function buildContentItems() {
  return MEMBERS.map(member => {
    const [colSpan, rowSpan] = member.size.split('x').map(Number);
    const initials = member.name
      .split(' ')
      .map(w => w[0])
      .join('');
    
    return {
      type: 'member',
      id: member.id,
      src: member.src,
      colSpan,
      rowSpan,
      name: member.name,
      deptLabel: member.deptLabel,
      initials,
    };
  });
}

window.ORPITA = window.ORPITA || {};
window.ORPITA.MEMBERS = MEMBERS;
window.ORPITA.shuffleArray = shuffleArray;
window.ORPITA.hashStringToHue = hashStringToHue;
window.ORPITA.buildContentItems = buildContentItems;
window.ORPITA.CONTENT_ITEMS = buildContentItems();