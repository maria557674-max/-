export interface Word {
  korean: string;
  english: string;
  category: string;
  hasBatchim?: boolean;
  imageUrl?: string;
}

export const VOCABULARY: Word[] = [
  // Nations
  { korean: "한국", english: "Korea", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/korea/400/300" },
  { korean: "중국", english: "China", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/china/400/300" },
  { korean: "일본", english: "Japan", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/japan/400/300" },
  { korean: "베트남", english: "Vietnam", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/vietnam/400/300" },
  { korean: "필리핀", english: "Philippines", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/philippines/400/300" },
  { korean: "태국", english: "Thailand", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/thailand/400/300" },
  { korean: "러시아", english: "Russia", category: "국가", hasBatchim: false, imageUrl: "https://picsum.photos/seed/russia/400/300" },
  { korean: "우즈베키스탄", english: "Uzbekistan", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/uzbekistan/400/300" },
  { korean: "캄보디아", english: "Cambodia", category: "국가", hasBatchim: false, imageUrl: "https://picsum.photos/seed/cambodia/400/300" },
  { korean: "몽골", english: "Mongolia", category: "국가", hasBatchim: true, imageUrl: "https://picsum.photos/seed/mongolia/400/300" },
  { korean: "미얀마", english: "Myanmar", category: "국가", hasBatchim: false, imageUrl: "https://picsum.photos/seed/myanmar/400/300" },

  // Occupations
  { korean: "학생", english: "Student", category: "직업", hasBatchim: true, imageUrl: "https://picsum.photos/seed/student/400/300" },
  { korean: "선생님", english: "Teacher", category: "직업", hasBatchim: true, imageUrl: "https://picsum.photos/seed/teacher/400/300" },
  { korean: "회사원", english: "Office worker", category: "직업", hasBatchim: true, imageUrl: "https://picsum.photos/seed/office/400/300" },
  { korean: "주부", english: "Housewife", category: "직업", hasBatchim: false, imageUrl: "https://picsum.photos/seed/housewife/400/300" },
  { korean: "요리사", english: "Cook/Chef", category: "직업", hasBatchim: false, imageUrl: "https://picsum.photos/seed/chef/400/300" },
  { korean: "운전기사", english: "Driver", category: "직업", hasBatchim: false, imageUrl: "https://picsum.photos/seed/driver/400/300" },
  { korean: "경찰관", english: "Police officer", category: "직업", hasBatchim: true, imageUrl: "https://picsum.photos/seed/police/400/300" },
  { korean: "의사", english: "Doctor", category: "직업", hasBatchim: false, imageUrl: "https://picsum.photos/seed/doctor/400/300" },
  { korean: "공무원", english: "Government employee", category: "직업", hasBatchim: true, imageUrl: "https://picsum.photos/seed/government/400/300" },

  // Greetings
  { korean: "안녕하세요?", english: "Hello / How are you?", category: "인사말", imageUrl: "https://picsum.photos/seed/hello/400/300" },
  { korean: "반갑습니다", english: "Nice to meet you", category: "인사말", imageUrl: "https://picsum.photos/seed/welcome/400/300" },
  { korean: "안녕히 가세요", english: "Goodbye (to someone leaving)", category: "인사말", imageUrl: "https://picsum.photos/seed/bye1/400/300" },
  { korean: "안녕히 계세요", english: "Goodbye (to someone staying)", category: "인사말", imageUrl: "https://picsum.photos/seed/bye2/400/300" },
  { korean: "네", english: "Yes", category: "인사말", imageUrl: "https://picsum.photos/seed/yes/400/300" },
  { korean: "아니요", english: "No", category: "인사말", imageUrl: "https://picsum.photos/seed/no/400/300" },

  // Nouns & Pronouns
  { korean: "저", english: "I (polite)", category: "명사/대명사", hasBatchim: false, imageUrl: "https://picsum.photos/seed/me/400/300" },
  { korean: "나", english: "I (casual)", category: "명사/대명사", hasBatchim: false, imageUrl: "https://picsum.photos/seed/me2/400/300" },
  { korean: "이름", english: "Name", category: "명사/대명사", hasBatchim: true, imageUrl: "https://picsum.photos/seed/name/400/300" },
  { korean: "사람", english: "Person", category: "명사/대명사", hasBatchim: true, imageUrl: "https://picsum.photos/seed/person/400/300" },
  { korean: "친구", english: "Friend", category: "명사/대명사", hasBatchim: false, imageUrl: "https://picsum.photos/seed/friend/400/300" },
  { korean: "씨", english: "Mr./Ms.", category: "명사/대명사", hasBatchim: false, imageUrl: "https://picsum.photos/seed/honorific/400/300" },
];
