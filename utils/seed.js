require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Mark = require('./models/Mark');

// ── 87 Students from Excel ──
const STUDENTS = [
  { name: 'SHREYA MISHRA',                     regdNo: '24110262' },
  { name: 'ABHINIT PRADHAN',                   regdNo: '24110263' },
  { name: 'ARYA SUBHOJIT PATRA',               regdNo: '24110264' },
  { name: 'BANDITA PRIYADARSHINI',             regdNo: '24110265' },
  { name: 'SUBHAM SRINIBAS PANDA',             regdNo: '24110266' },
  { name: 'AKANKSHYA SAHOO',                   regdNo: '24110267' },
  { name: 'PRATIK MISHRA',                     regdNo: '24110268' },
  { name: 'ADYA ARCHITA PATINAIK',             regdNo: '24110269' },
  { name: 'SOYAM PATRA',                       regdNo: '24110270' },
  { name: 'HRUSHIKESH PANDA',                  regdNo: '24110271' },
  { name: 'SATYA PRAKASH DASH',                regdNo: '24110272' },
  { name: 'ADITYA PADHI',                      regdNo: '24110273' },
  { name: 'SUBHASHREE GIRI',                   regdNo: '24110274' },
  { name: 'SOURADEEP ROY',                     regdNo: '24110275' },
  { name: 'ARPITA MAHAPATRA',                  regdNo: '24110276' },
  { name: 'BIBHUDUTTA PANDA',                  regdNo: '24110277' },
  { name: 'NIPUNA MAHAKUR',                    regdNo: '24110278' },
  { name: 'SAILEN SAHOO',                      regdNo: '24110280' },
  { name: 'BHARATI HANSDA',                    regdNo: '24110281' },
  { name: 'JATINDRA SAIPRASANNA BEHERA',       regdNo: '24110282' },
  { name: 'JAGYANSENI SWAIN',                  regdNo: '24110284' },
  { name: 'SAIRAM SAMBIT SAMAL',               regdNo: '24110285' },
  { name: 'ABHISHEK TRIPATHY',                 regdNo: '24110286' },
  { name: 'PRATIK KUMAR DAS',                  regdNo: '24110287' },
  { name: 'SUBHENDU BEHERA',                   regdNo: '24110288' },
  { name: 'TANMAYA TRIPATHY',                  regdNo: '24110289' },
  { name: 'JYOTSHNA RANI HEMBRAM',             regdNo: '24110291' },
  { name: 'SNEHASIS PADHY',                    regdNo: '24110292' },
  { name: 'JITENDRA BEHERA',                   regdNo: '24110293' },
  { name: 'ASHUTOSH BADAPANDA',                regdNo: '24110294' },
  { name: 'DIKSHYA MOHANTY',                   regdNo: '23110267' },
  { name: 'ANUBHAV ACHARYA',                   regdNo: '24110295' },
  { name: 'V PRIYANKA',                        regdNo: '24110296' },
  { name: 'RUDRA PRASAD DASH',                 regdNo: '24110297' },
  { name: 'BALABHADRA PADHI',                  regdNo: '24110298' },
  { name: 'BISHAL KHUNTIA',                    regdNo: '24110299' },
  { name: 'DEVIPRASAD PANDA',                  regdNo: '24110300' },
  { name: 'DINDAYAL BIDYASAGAR',               regdNo: '24110301' },
  { name: 'ROSALIN NAYAK',                     regdNo: '24110302' },
  { name: 'OM PRAKASH',                        regdNo: '24110303' },
  { name: 'RONIT KISHAN',                      regdNo: '24110304' },
  { name: 'ARUSHI DAS',                        regdNo: '24110306' },
  { name: 'RUDRA PRASAD SARANGI',              regdNo: '24110307' },
  { name: 'ABHISHEK EKKA',                     regdNo: '24110308' },
  { name: 'PRANAY PRATIK ROUL',                regdNo: '24110309' },
  { name: 'SAISHREE PADHI',                    regdNo: '24110310' },
  { name: 'SNEHA TRIPATHY',                    regdNo: '24110311' },
  { name: 'KUMAR JYOTI MOHAPATRA',             regdNo: '24110312' },
  { name: 'PRIYA RANJAN SENAPATI',             regdNo: '24110313' },
  { name: 'PRATEEK DAS',                       regdNo: '24110315' },
  { name: 'RAKSHIT KUMAR MOHANTY',             regdNo: '24110316' },
  { name: 'SUBHAM SAMAL',                      regdNo: '24110317' },
  { name: 'PRATIK KUMAR JESTHI',               regdNo: '24110318' },
  { name: 'ADITI TIRKEY',                      regdNo: '24110319' },
  { name: 'BIDHU BHUSAN PATRA',                regdNo: '24110320' },
  { name: 'ASHIS MOHAPATRA',                   regdNo: '24110321' },
  { name: 'PATRA KISHAN KANGRES',              regdNo: '24110322' },
  { name: 'HEMENDRA NAIK',                     regdNo: '24110324' },
  { name: 'AVIGYAN PADHI',                     regdNo: '2211100134' },
  { name: 'J SUBHASHREE',                      regdNo: '24110157' },
  { name: 'DIBYAJYOTI PARIDA',                 regdNo: '24110224' },
  { name: 'ADITYA PANIGRAHI',                  regdNo: '24110325' },
  { name: 'SWASTIK SUMAN PADHI',               regdNo: '24110326' },
  { name: 'AKANKSHYA RANI PANDA',              regdNo: '24110327' },
  { name: 'SHIVAM KUMAR PANDEY',               regdNo: '24110328' },
  { name: 'ABHINNA SUNDAR NAYAK',              regdNo: '24110329' },
  { name: 'KULDEEP LAKRA',                     regdNo: '24110330' },
  { name: 'DEBASISH BAL',                      regdNo: '24110334' },
  { name: 'SWASTIJ KUMAR SAHU',                regdNo: '24110335' },
  { name: 'DIBYANSU DIBYASWARUP SAHOO',        regdNo: '24110336' },
  { name: 'SAROJ PANDA',                       regdNo: '24110337' },
  { name: 'PRASHIKHA DHAL',                    regdNo: '24110338' },
  { name: 'AKASH BHOI',                        regdNo: '24110339' },
  { name: 'SUBHAM CHOUDHURY',                  regdNo: '24110349' },
  { name: 'MAYANK KUMAR ACHARYA',              regdNo: '24110378' },
  { name: 'ANWESH PAITAL',                     regdNo: '24110644' },
  { name: 'SHAMAR KHAN',                       regdNo: '24110738' },
  { name: 'AKASH KUMAR BEHERA',                regdNo: '25120028' },
  { name: 'BHOJARAJ JAYAPURIA',                regdNo: '25120029' },
  { name: 'DEEPTI RAJ POLAI',                  regdNo: '25120030' },
  { name: 'GOURAB SWAIN',                      regdNo: '25120031' },
  { name: 'NIBEDITA SAHU',                     regdNo: '25120032' },
  { name: 'P LILA DORA',                       regdNo: '25120033' },
  { name: 'PRAKASH MUDULI',                    regdNo: '25120034' },
  { name: 'RAKESH PATRA',                      regdNo: '25120035' },
  { name: 'SRIKANTA BARIK',                    regdNo: '25120036' },
  { name: 'SUBHASHREE PRIYADARSHINI SAHOO',    regdNo: '25120037' },
];

const SUBJECTS = ['OOPS', 'EECO', 'DM', 'AAD', 'OS', 'DAI'];

// ── Seeded random (reproducible) ──
let seed = 42;
function seededRand() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return Math.abs(seed) / 0xffffffff;
}
function randInt(min, max) {
  return Math.floor(seededRand() * (max - min + 1)) + min;
}

// ── Student tiers (deterministic by index) ──
//  top ~18%   → index % 10 === 0,1
//  average ~54% → index % 10 === 2..7
//  at-risk ~28% → index % 10 === 8,9
function getTier(index) {
  const r = index % 10;
  if (r <= 1) return 'top';
  if (r <= 7) return 'average';
  return 'atrisk';
}

// Special subject weakness per tier (makes analytics interesting)
const WEAK_SUBJECTS = {
  atrisk: { OOPS: true, AAD: true },        // at-risk students weak in hard subjects
  average: { DM: true },                     // average students slightly weak in DM
  top: {},
};

function generateMarks(tier, subject) {
  const isWeak = WEAK_SUBJECTS[tier][subject];

  let midterm, assignment, quiz_attendance, end_sem;

  if (tier === 'top') {
    midterm         = randInt(16, 20);
    assignment      = randInt(8, 10);
    quiz_attendance = randInt(8, 10);
    end_sem         = randInt(50, 60);
  } else if (tier === 'average') {
    if (isWeak) {
      midterm         = randInt(9, 14);
      assignment      = randInt(5, 8);
      quiz_attendance = randInt(5, 8);
      end_sem         = randInt(28, 42);
    } else {
      midterm         = randInt(12, 18);
      assignment      = randInt(6, 9);
      quiz_attendance = randInt(6, 9);
      end_sem         = randInt(36, 52);
    }
  } else { // atrisk
    if (isWeak) {
      midterm         = randInt(4, 10);
      assignment      = randInt(2, 6);
      quiz_attendance = randInt(2, 6);
      end_sem         = randInt(10, 26);
    } else {
      midterm         = randInt(8, 14);
      assignment      = randInt(4, 7);
      quiz_attendance = randInt(4, 7);
      end_sem         = randInt(24, 38);
    }
  }

  const internal_total = midterm + assignment + quiz_attendance;
  const final_total    = internal_total + end_sem;
  const grade =
    final_total >= 90 ? 'A' :
    final_total >= 75 ? 'B' :
    final_total >= 50 ? 'C' : 'D';

  return { subject, midterm, assignment, quiz_attendance, end_sem, internal_total, final_total, grade };
}

// ── Seed Users ──
const USERS = [
  { name: 'Admin OUTR',    email: 'admin@outr.ac.in',   password: 'Admin@123',   role: 'admin' },
  { name: 'Dr. S. Panda',  email: 'spanda@outr.ac.in',  password: 'Teacher@123', role: 'teacher' },
  { name: 'Dr. R. Mishra', email: 'rmishra@outr.ac.in', password: 'Teacher@123', role: 'teacher' },
];

// ── Main Seed ──
async function seed_db() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Student.deleteMany(), Mark.deleteMany()]);
    console.log('🗑  Cleared existing data');

    // Seed users
    for (const u of USERS) {
      await User.create(u);
    }
    console.log(`👤 Seeded ${USERS.length} users`);

    // Seed students
    const studentDocs = await Student.insertMany(STUDENTS);
    console.log(`🎓 Seeded ${studentDocs.length} students`);

    // Seed marks
    const allMarks = [];
    studentDocs.forEach((student, idx) => {
      const tier = getTier(idx);
      SUBJECTS.forEach(subject => {
        const m = generateMarks(tier, subject);
        allMarks.push({ studentId: student._id, ...m });
      });
    });

    await Mark.insertMany(allMarks);
    console.log(`📊 Seeded ${allMarks.length} mark records (${SUBJECTS.length} subjects × ${studentDocs.length} students)`);

    // Print distribution summary
    const tierCounts = { top: 0, average: 0, atrisk: 0 };
    studentDocs.forEach((_, i) => tierCounts[getTier(i)]++);
    console.log('\n📈 Student Tier Distribution:');
    console.log(`   Top Performers : ${tierCounts.top}  students`);
    console.log(`   Average        : ${tierCounts.average}  students`);
    console.log(`   At-Risk        : ${tierCounts.atrisk}  students`);

    const gradeD = allMarks.filter(m => m.grade === 'D').length;
    const gradeC = allMarks.filter(m => m.grade === 'C').length;
    const gradeB = allMarks.filter(m => m.grade === 'B').length;
    const gradeA = allMarks.filter(m => m.grade === 'A').length;
    console.log('\n🏅 Grade Distribution Across All Marks:');
    console.log(`   A: ${gradeA} | B: ${gradeB} | C: ${gradeC} | D: ${gradeD}`);

    console.log('\n🔑 Login Credentials:');
    USERS.forEach(u => console.log(`   ${u.role.padEnd(7)} | ${u.email.padEnd(25)} | ${u.password}`));
    console.log('\n✅ Seed complete!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed_db();
