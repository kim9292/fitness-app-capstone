import { NextRequest, NextResponse } from "next/server";

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  targetMuscles: string[];
  instructions: string[];
}

// Comprehensive exercise database
const EXERCISES: Exercise[] = [
  // CHEST EXERCISES
  {
    id: "1",
    name: "Barbell Bench Press",
    description: "The king of chest exercises. Builds overall chest mass and strength.",
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    difficulty: "intermediate",
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    instructions: [
      "Lie flat on a bench with your feet firmly on the ground",
      "Grip the bar slightly wider than shoulder-width",
      "Unrack the bar and lower it to your mid-chest",
      "Press the bar back up to the starting position",
      "Keep your shoulder blades retracted throughout"
    ]
  },
  {
    id: "2",
    name: "Push-Ups",
    description: "A classic bodyweight exercise that builds chest, shoulders, and triceps.",
    videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
    difficulty: "beginner",
    targetMuscles: ["Chest", "Triceps", "Shoulders", "Core"],
    instructions: [
      "Start in a plank position with hands shoulder-width apart",
      "Keep your body in a straight line from head to heels",
      "Lower your chest to the ground by bending your elbows",
      "Push back up to the starting position",
      "Keep your core tight throughout the movement"
    ]
  },
  {
    id: "3",
    name: "Dumbbell Flyes",
    description: "Isolation exercise that targets the chest muscles with a stretch.",
    videoUrl: "https://www.youtube.com/embed/eozdVDA78K0",
    difficulty: "intermediate",
    targetMuscles: ["Chest"],
    instructions: [
      "Lie on a flat bench holding dumbbells above your chest",
      "Keep a slight bend in your elbows",
      "Lower the weights out to the sides in an arc motion",
      "Feel a stretch in your chest at the bottom",
      "Bring the weights back together at the top"
    ]
  },

  // BACK EXERCISES
  {
    id: "4",
    name: "Deadlift",
    description: "The ultimate full-body strength builder. Targets the entire posterior chain.",
    videoUrl: "https://www.youtube.com/embed/op9kVnSso6Q",
    difficulty: "advanced",
    targetMuscles: ["Back", "Glutes", "Hamstrings", "Core"],
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend down and grip the bar just outside your legs",
      "Keep your back straight and chest up",
      "Drive through your heels and stand up with the bar",
      "Lower the bar back down with control"
    ]
  },
  {
    id: "5",
    name: "Pull-Ups",
    description: "Classic bodyweight exercise for building a wide, strong back.",
    videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
    difficulty: "intermediate",
    targetMuscles: ["Back", "Biceps", "Shoulders"],
    instructions: [
      "Hang from a pull-up bar with hands slightly wider than shoulders",
      "Pull your body up until your chin is over the bar",
      "Keep your core tight and avoid swinging",
      "Lower yourself back down with control",
      "Fully extend your arms at the bottom"
    ]
  },
  {
    id: "5a",
    name: "Muscle-Up",
    description: "Explosive pull-up that transitions into a dip over the bar; advanced total upper-body power move.",
    videoUrl: "https://www.youtube.com/embed/qHB1XrP7q8Q",
    difficulty: "advanced",
    targetMuscles: ["Back", "Biceps", "Shoulders", "Triceps", "Core"],
    instructions: [
      "Start with a false grip if possible and hang from the bar",
      "Explosively pull your chest toward and slightly above the bar",
      "As you reach the bar, lean your chest over your hands and drive elbows up",
      "Transition smoothly into the dip position on top of the bar",
      "Press to full lockout, then lower with control back to hang"
    ]
  },
  {
    id: "6",
    name: "Barbell Rows",
    description: "Compound movement for building thick, strong back muscles.",
    videoUrl: "https://www.youtube.com/embed/FWJR5Ve8bnQ",
    difficulty: "intermediate",
    targetMuscles: ["Back", "Biceps", "Core"],
    instructions: [
      "Bend over with a flat back, holding the bar",
      "Keep your knees slightly bent",
      "Pull the bar to your lower chest/upper abdomen",
      "Squeeze your shoulder blades together at the top",
      "Lower the bar back down with control"
    ]
  },
  {
    id: "7",
    name: "Lat Pulldowns",
    description: "Great machine exercise for building lat width and strength.",
    videoUrl: "https://www.youtube.com/embed/CAwf7n6Luuc",
    difficulty: "beginner",
    targetMuscles: ["Back", "Biceps"],
    instructions: [
      "Sit at the lat pulldown machine with knees secured",
      "Grip the bar wider than shoulder-width",
      "Pull the bar down to your upper chest",
      "Squeeze your shoulder blades together",
      "Slowly return to the starting position"
    ]
  },

  // LEG EXERCISES
  {
    id: "8",
    name: "Barbell Squats",
    description: "The king of leg exercises. Builds massive quads, glutes, and overall leg strength.",
    videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
    difficulty: "intermediate",
    targetMuscles: ["Quads", "Glutes", "Hamstrings", "Core"],
    instructions: [
      "Position the bar on your upper back/traps",
      "Stand with feet shoulder-width apart",
      "Lower your hips back and down as if sitting in a chair",
      "Keep your chest up and knees tracking over toes",
      "Drive through your heels to stand back up"
    ]
  },
  {
    id: "9",
    name: "Romanian Deadlift",
    description: "Targets hamstrings and glutes with a hip hinge movement.",
    videoUrl: "https://www.youtube.com/embed/2SHsk9AzdjA",
    difficulty: "intermediate",
    targetMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    instructions: [
      "Stand holding a barbell at hip level",
      "Keep a slight bend in your knees",
      "Hinge at the hips and lower the bar down your legs",
      "Feel a stretch in your hamstrings",
      "Drive your hips forward to return to standing"
    ]
  },
  {
    id: "10",
    name: "Lunges",
    description: "Unilateral leg exercise that builds strength and balance.",
    videoUrl: "https://www.youtube.com/embed/QOVaHwm-Q6U",
    difficulty: "beginner",
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    instructions: [
      "Stand with feet hip-width apart",
      "Step forward with one leg",
      "Lower your back knee toward the ground",
      "Keep your front knee over your ankle",
      "Push through your front heel to return to standing"
    ]
  },
  {
    id: "11",
    name: "Leg Press",
    description: "Machine-based exercise for building quad and glute strength.",
    videoUrl: "https://www.youtube.com/embed/IZxyjW7MPJQ",
    difficulty: "beginner",
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    instructions: [
      "Sit in the leg press machine with feet shoulder-width on platform",
      "Release the safety and lower the weight with control",
      "Lower until your knees are at 90 degrees",
      "Press through your heels to extend your legs",
      "Don't lock out your knees at the top"
    ]
  },

  // SHOULDER EXERCISES
  {
    id: "12",
    name: "Overhead Press",
    description: "Compound movement for building strong, well-rounded shoulders.",
    videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
    difficulty: "intermediate",
    targetMuscles: ["Shoulders", "Triceps", "Core"],
    instructions: [
      "Stand holding a barbell at shoulder height",
      "Keep your core tight and glutes engaged",
      "Press the bar straight overhead",
      "Lock out your elbows at the top",
      "Lower the bar back to your shoulders with control"
    ]
  },
  {
    id: "13",
    name: "Lateral Raises",
    description: "Isolation exercise for building shoulder width and definition.",
    videoUrl: "https://www.youtube.com/embed/3VcKaXpzqRo",
    difficulty: "beginner",
    targetMuscles: ["Shoulders"],
    instructions: [
      "Stand holding dumbbells at your sides",
      "Keep a slight bend in your elbows",
      "Raise the weights out to the sides until shoulder height",
      "Lead with your elbows, not your hands",
      "Lower back down with control"
    ]
  },
  {
    id: "14",
    name: "Face Pulls",
    description: "Great exercise for rear delts and upper back health.",
    videoUrl: "https://www.youtube.com/embed/rep-qVOkqgk",
    difficulty: "beginner",
    targetMuscles: ["Shoulders", "Upper Back"],
    instructions: [
      "Set a rope attachment at upper chest height",
      "Pull the rope toward your face",
      "Separate the ends of the rope as you pull",
      "Squeeze your shoulder blades together",
      "Slowly return to the starting position"
    ]
  },

  // ARM EXERCISES
  {
    id: "15",
    name: "Barbell Bicep Curls",
    description: "Classic bicep builder for arm mass and strength.",
    videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    difficulty: "beginner",
    targetMuscles: ["Biceps"],
    instructions: [
      "Stand holding a barbell with an underhand grip",
      "Keep your elbows close to your sides",
      "Curl the bar up toward your shoulders",
      "Squeeze your biceps at the top",
      "Lower the bar back down with control"
    ]
  },
  {
    id: "16",
    name: "Tricep Dips",
    description: "Bodyweight exercise for building tricep size and strength.",
    videoUrl: "https://www.youtube.com/embed/6kALZikXxLc",
    difficulty: "intermediate",
    targetMuscles: ["Triceps", "Chest", "Shoulders"],
    instructions: [
      "Position yourself on parallel bars or a bench",
      "Lower your body by bending your elbows",
      "Go down until your elbows are at 90 degrees",
      "Push yourself back up to the starting position",
      "Keep your core tight throughout"
    ]
  },
  {
    id: "17",
    name: "Hammer Curls",
    description: "Targets the biceps and forearms with a neutral grip.",
    videoUrl: "https://www.youtube.com/embed/zC3nLlEvin4",
    difficulty: "beginner",
    targetMuscles: ["Biceps", "Forearms"],
    instructions: [
      "Stand holding dumbbells with palms facing each other",
      "Keep your elbows close to your sides",
      "Curl the weights up toward your shoulders",
      "Maintain the neutral grip throughout",
      "Lower back down with control"
    ]
  },
  {
    id: "17a",
    name: "Spider Curls",
    description: "Isolation bicep exercise performed on an incline bench that eliminates momentum and maximizes bicep peak development.",
    videoUrl: "https://www.youtube.com/embed/mXwO6Urx4b4",
    difficulty: "intermediate",
    targetMuscles: ["Biceps"],
    instructions: [
      "Lean forward over an incline bench with chest against the pad",
      "Let your arms hang straight down holding dumbbells or barbell",
      "Curl the weight up toward your shoulders",
      "Squeeze your biceps hard at the top",
      "Lower back down slowly to full extension",
      "Keep your upper arms stationary throughout"
    ]
  },
  {
    id: "17b",
    name: "Preacher Curls",
    description: "Bicep isolation exercise using a preacher bench for strict form and peak contraction.",
    videoUrl: "https://www.youtube.com/embed/fIWP-FRFNU0",
    difficulty: "beginner",
    targetMuscles: ["Biceps"],
    instructions: [
      "Sit at a preacher bench with arms resting on the pad",
      "Hold a barbell or dumbbells with an underhand grip",
      "Curl the weight up toward your shoulders",
      "Keep your upper arms pressed against the pad",
      "Lower back down slowly with control"
    ]
  },
  {
    id: "17c",
    name: "Concentration Curls",
    description: "Single-arm bicep exercise that allows maximum focus and mind-muscle connection.",
    videoUrl: "https://www.youtube.com/embed/Jvj2wV0vOYU",
    difficulty: "beginner",
    targetMuscles: ["Biceps"],
    instructions: [
      "Sit on a bench with legs spread",
      "Rest your elbow on the inside of your thigh",
      "Curl the dumbbell up toward your shoulder",
      "Focus on squeezing the bicep at the top",
      "Lower back down with control"
    ]
  },
  {
    id: "17d",
    name: "Cable Bicep Curls",
    description: "Provides constant tension throughout the entire range of motion for bicep growth.",
    videoUrl: "https://www.youtube.com/embed/Jvj2wV0vOYU",
    difficulty: "beginner",
    targetMuscles: ["Biceps"],
    instructions: [
      "Stand facing a low cable pulley with a bar attachment",
      "Grip the bar with an underhand grip",
      "Keep your elbows close to your sides",
      "Curl the bar up toward your shoulders",
      "Squeeze at the top and lower with control"
    ]
  },

  // CORE EXERCISES
  {
    id: "18",
    name: "Planks",
    description: "Isometric core exercise for building stability and endurance.",
    videoUrl: "https://www.youtube.com/embed/ASdvN_XEl_c",
    difficulty: "beginner",
    targetMuscles: ["Core", "Abs", "Lower Back"],
    instructions: [
      "Start in a forearm plank position",
      "Keep your body in a straight line from head to heels",
      "Engage your core and glutes",
      "Hold the position without sagging or piking",
      "Breathe steadily throughout"
    ]
  },
  {
    id: "19",
    name: "Russian Twists",
    description: "Dynamic core exercise that targets the obliques.",
    videoUrl: "https://www.youtube.com/embed/wkD8rjkodUI",
    difficulty: "beginner",
    targetMuscles: ["Core", "Obliques"],
    instructions: [
      "Sit on the ground with knees bent and feet elevated",
      "Lean back slightly and hold a weight at your chest",
      "Twist your torso to one side",
      "Touch the weight to the ground beside you",
      "Twist to the other side and repeat"
    ]
  },
  {
    id: "20",
    name: "Hanging Leg Raises",
    description: "Advanced ab exercise for building core strength.",
    videoUrl: "https://www.youtube.com/embed/Pr1ieGZ5atk",
    difficulty: "advanced",
    targetMuscles: ["Abs", "Hip Flexors"],
    instructions: [
      "Hang from a pull-up bar with straight arms",
      "Keep your legs straight or slightly bent",
      "Raise your legs up to parallel or higher",
      "Control the movement, don't swing",
      "Lower your legs back down with control"
    ]
  },

  // GLUTE EXERCISES
  {
    id: "21",
    name: "Hip Thrusts",
    description: "The best exercise for building powerful glutes.",
    videoUrl: "https://www.youtube.com/embed/SEdqd1n0cvg",
    difficulty: "intermediate",
    targetMuscles: ["Glutes", "Hamstrings"],
    instructions: [
      "Sit on the ground with your upper back against a bench",
      "Place a barbell across your hips",
      "Drive through your heels and thrust your hips up",
      "Squeeze your glutes hard at the top",
      "Lower back down with control"
    ]
  },
  {
    id: "22",
    name: "Bulgarian Split Squats",
    description: "Unilateral leg exercise that heavily targets glutes and quads.",
    videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE",
    difficulty: "intermediate",
    targetMuscles: ["Glutes", "Quads", "Hamstrings"],
    instructions: [
      "Stand in a split stance with rear foot elevated on a bench",
      "Lower your back knee toward the ground",
      "Keep your front knee over your ankle",
      "Drive through your front heel to stand back up",
      "Maintain balance throughout the movement"
    ]
  },

  // CALISTHENICS
  {
    id: "23",
    name: "Burpees",
    description: "Full-body conditioning exercise that builds strength and cardio.",
    videoUrl: "https://www.youtube.com/embed/auBLPXO8Fww",
    difficulty: "intermediate",
    targetMuscles: ["Full Body", "Core", "Legs", "Chest"],
    instructions: [
      "Start standing, then drop into a squat",
      "Place your hands on the ground and jump feet back to plank",
      "Perform a push-up",
      "Jump your feet back to your hands",
      "Explode up into a jump"
    ]
  },
  {
    id: "24",
    name: "Mountain Climbers",
    description: "Dynamic core and cardio exercise.",
    videoUrl: "https://www.youtube.com/embed/nmwgirgXLYM",
    difficulty: "beginner",
    targetMuscles: ["Core", "Shoulders", "Legs"],
    instructions: [
      "Start in a high plank position",
      "Drive one knee toward your chest",
      "Quickly switch legs in a running motion",
      "Keep your hips level and core tight",
      "Maintain a steady rhythm"
    ]
  },

  // MORE CHEST EXERCISES
  {
    id: "25",
    name: "Incline Bench Press",
    description: "Targets upper chest with an incline angle.",
    videoUrl: "https://www.youtube.com/embed/DbFgADa2PL8",
    difficulty: "intermediate",
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    instructions: [
      "Set bench to 30-45 degree incline",
      "Grip bar slightly wider than shoulders",
      "Lower bar to upper chest",
      "Press back up explosively",
      "Keep shoulder blades retracted"
    ]
  },
  {
    id: "26",
    name: "Decline Bench Press",
    description: "Emphasizes lower chest development.",
    videoUrl: "https://www.youtube.com/embed/LfyQBUKR8SE",
    difficulty: "intermediate",
    targetMuscles: ["Chest", "Triceps"],
    instructions: [
      "Secure feet in decline bench",
      "Grip bar at shoulder width",
      "Lower to lower chest area",
      "Press back up powerfully",
      "Maintain control throughout"
    ]
  },
  {
    id: "27",
    name: "Cable Chest Flyes",
    description: "Provides constant tension for chest development.",
    videoUrl: "https://www.youtube.com/embed/taI4XduLpTk",
    difficulty: "beginner",
    targetMuscles: ["Chest"],
    instructions: [
      "Stand between cable towers",
      "Hold handles with slight bend in elbows",
      "Bring hands together in front of chest",
      "Squeeze chest at peak contraction",
      "Return to stretch position slowly"
    ]
  },
  {
    id: "28",
    name: "Chest Dips",
    description: "Bodyweight exercise for lower chest and triceps.",
    videoUrl: "https://www.youtube.com/embed/2z8JmcrW-As",
    difficulty: "intermediate",
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    instructions: [
      "Grip parallel bars and lift body up",
      "Lean forward slightly for chest emphasis",
      "Lower until elbows at 90 degrees",
      "Press back up to start",
      "Keep movement controlled"
    ]
  },

  // MORE BACK EXERCISES
  {
    id: "29",
    name: "T-Bar Rows",
    description: "Builds thick back muscles with heavy weight.",
    videoUrl: "https://www.youtube.com/embed/j3Igk5nyZE4",
    difficulty: "intermediate",
    targetMuscles: ["Back", "Biceps"],
    instructions: [
      "Straddle T-bar with chest supported",
      "Grip handles with both hands",
      "Pull weight to chest",
      "Squeeze shoulder blades together",
      "Lower with control"
    ]
  },
  {
    id: "30",
    name: "Seated Cable Rows",
    description: "Targets mid-back with constant tension.",
    videoUrl: "https://www.youtube.com/embed/GZbfZ033f74",
    difficulty: "beginner",
    targetMuscles: ["Back", "Biceps"],
    instructions: [
      "Sit at cable row machine",
      "Grip handle with both hands",
      "Pull handle to lower chest",
      "Squeeze shoulder blades back",
      "Extend arms fully on return"
    ]
  },
  {
    id: "31",
    name: "Single-Arm Dumbbell Rows",
    description: "Unilateral back exercise for muscle balance.",
    videoUrl: "https://www.youtube.com/embed/roCP6wCXPqo",
    difficulty: "beginner",
    targetMuscles: ["Back", "Biceps"],
    instructions: [
      "Place one knee and hand on bench",
      "Hold dumbbell in free hand",
      "Pull weight to hip",
      "Keep back flat and core tight",
      "Lower with control"
    ]
  },
  {
    id: "32",
    name: "Chin-Ups",
    description: "Underhand grip variation emphasizing biceps.",
    videoUrl: "https://www.youtube.com/embed/brhRXlOhkAM",
    difficulty: "intermediate",
    targetMuscles: ["Back", "Biceps"],
    instructions: [
      "Hang from bar with underhand grip",
      "Pull chin above bar",
      "Squeeze biceps and back",
      "Lower with control",
      "Full arm extension at bottom"
    ]
  },
  {
    id: "33",
    name: "Shrugs",
    description: "Isolates trapezius muscles for upper back development.",
    videoUrl: "https://www.youtube.com/embed/cJRVVxmytaM",
    difficulty: "beginner",
    targetMuscles: ["Traps", "Upper Back"],
    instructions: [
      "Hold heavy dumbbells or barbell",
      "Lift shoulders straight up",
      "Hold peak contraction briefly",
      "Lower shoulders back down",
      "Keep arms straight throughout"
    ]
  },

  // MORE LEG EXERCISES
  {
    id: "34",
    name: "Front Squats",
    description: "Quad-dominant squat variation with front-loaded barbell.",
    videoUrl: "https://www.youtube.com/embed/uYumuL_G_V0",
    difficulty: "advanced",
    targetMuscles: ["Quads", "Core", "Glutes"],
    instructions: [
      "Rest bar on front shoulders",
      "Keep elbows high and chest up",
      "Squat down keeping torso upright",
      "Drive through heels to stand",
      "Maintain core stability"
    ]
  },
  {
    id: "35",
    name: "Leg Extensions",
    description: "Isolation exercise for quadriceps.",
    videoUrl: "https://www.youtube.com/embed/YyvSfVjQeL0",
    difficulty: "beginner",
    targetMuscles: ["Quads"],
    instructions: [
      "Sit in leg extension machine",
      "Place ankles under pad",
      "Extend legs fully",
      "Squeeze quads at top",
      "Lower with control"
    ]
  },
  {
    id: "36",
    name: "Leg Curls",
    description: "Isolates hamstrings for leg development.",
    videoUrl: "https://www.youtube.com/embed/ELOCsoDSmrg",
    difficulty: "beginner",
    targetMuscles: ["Hamstrings"],
    instructions: [
      "Lie face down on leg curl machine",
      "Place ankles under pad",
      "Curl legs toward glutes",
      "Squeeze hamstrings at top",
      "Lower slowly"
    ]
  },
  {
    id: "37",
    name: "Calf Raises",
    description: "Builds calf muscles for lower leg strength.",
    videoUrl: "https://www.youtube.com/embed/gwLzBJYoWlI",
    difficulty: "beginner",
    targetMuscles: ["Calves"],
    instructions: [
      "Stand on elevated platform",
      "Rise up onto toes",
      "Hold peak contraction",
      "Lower heels below platform",
      "Feel stretch in calves"
    ]
  },
  {
    id: "38",
    name: "Goblet Squats",
    description: "Beginner-friendly squat with dumbbell held at chest.",
    videoUrl: "https://www.youtube.com/embed/MeHQ93AKcWA",
    difficulty: "beginner",
    targetMuscles: ["Quads", "Glutes", "Core"],
    instructions: [
      "Hold dumbbell at chest with both hands",
      "Stand with feet shoulder-width apart",
      "Squat down keeping chest up",
      "Drive through heels to stand",
      "Keep core engaged"
    ]
  },
  {
    id: "39",
    name: "Box Jumps",
    description: "Plyometric exercise for explosive leg power.",
    videoUrl: "https://www.youtube.com/embed/NBY9-kTuHEk",
    difficulty: "intermediate",
    targetMuscles: ["Quads", "Glutes", "Calves"],
    instructions: [
      "Stand facing a sturdy box",
      "Swing arms and jump onto box",
      "Land softly with knees bent",
      "Stand up fully on box",
      "Step down carefully"
    ]
  },

  // MORE SHOULDER EXERCISES
  {
    id: "40",
    name: "Arnold Press",
    description: "Dumbbell shoulder press with rotation for full deltoid development.",
    videoUrl: "https://www.youtube.com/embed/6Z15_WdXmVw",
    difficulty: "intermediate",
    targetMuscles: ["Shoulders", "Triceps"],
    instructions: [
      "Start with dumbbells at shoulder height, palms facing you",
      "Press up while rotating palms forward",
      "Finish with palms facing forward overhead",
      "Reverse motion on way down",
      "Control the rotation"
    ]
  },
  {
    id: "41",
    name: "Front Raises",
    description: "Isolation exercise for front deltoids.",
    videoUrl: "https://www.youtube.com/embed/SPuR38jeKKY",
    difficulty: "beginner",
    targetMuscles: ["Shoulders"],
    instructions: [
      "Hold dumbbells at thighs",
      "Raise weights straight forward",
      "Lift to shoulder height",
      "Lower slowly with control",
      "Keep slight bend in elbows"
    ]
  },
  {
    id: "42",
    name: "Rear Delt Flyes",
    description: "Targets rear deltoids for balanced shoulder development.",
    videoUrl: "https://www.youtube.com/embed/T5TkyJgNQzk",
    difficulty: "beginner",
    targetMuscles: ["Shoulders", "Upper Back"],
    instructions: [
      "Bend forward at hips",
      "Hold dumbbells with arms hanging",
      "Raise weights out to sides",
      "Squeeze shoulder blades together",
      "Lower with control"
    ]
  },
  {
    id: "43",
    name: "Upright Rows",
    description: "Compound movement for traps and shoulders.",
    videoUrl: "https://www.youtube.com/embed/KlAEa6jYPb8",
    difficulty: "intermediate",
    targetMuscles: ["Shoulders", "Traps"],
    instructions: [
      "Hold barbell at thighs",
      "Pull bar up along body",
      "Raise elbows high and wide",
      "Bar reaches chest height",
      "Lower slowly"
    ]
  },

  // MORE ARM EXERCISES
  {
    id: "44",
    name: "Skull Crushers",
    description: "Lying tricep extension for mass building.",
    videoUrl: "https://www.youtube.com/embed/d_KZxkY_0cM",
    difficulty: "intermediate",
    targetMuscles: ["Triceps"],
    instructions: [
      "Lie on bench holding bar overhead",
      "Lower bar toward forehead",
      "Keep upper arms stationary",
      "Extend arms back to start",
      "Control the negative"
    ]
  },
  {
    id: "45",
    name: "Overhead Tricep Extension",
    description: "Stretches and strengthens long head of triceps.",
    videoUrl: "https://www.youtube.com/embed/6SS6K3lAwZ8",
    difficulty: "beginner",
    targetMuscles: ["Triceps"],
    instructions: [
      "Hold dumbbell overhead with both hands",
      "Lower weight behind head",
      "Keep elbows pointing forward",
      "Extend arms back up",
      "Feel stretch in triceps"
    ]
  },
  {
    id: "46",
    name: "Close-Grip Bench Press",
    description: "Compound exercise emphasizing triceps.",
    videoUrl: "https://www.youtube.com/embed/nEF0bv2FW94",
    difficulty: "intermediate",
    targetMuscles: ["Triceps", "Chest"],
    instructions: [
      "Grip bar at shoulder width or narrower",
      "Lower bar to lower chest",
      "Keep elbows close to body",
      "Press back up powerfully",
      "Lock out at top"
    ]
  },
  {
    id: "47",
    name: "Zottman Curls",
    description: "Works biceps and forearms with rotation.",
    videoUrl: "https://www.youtube.com/embed/ZrpRiGbZQdQ",
    difficulty: "intermediate",
    targetMuscles: ["Biceps", "Forearms"],
    instructions: [
      "Curl dumbbells up with underhand grip",
      "Rotate to overhand grip at top",
      "Lower with overhand grip",
      "Rotate back at bottom",
      "Repeat the sequence"
    ]
  },
  {
    id: "48",
    name: "Wrist Curls",
    description: "Isolates forearm flexors.",
    videoUrl: "https://www.youtube.com/embed/16Kv26pHcXI",
    difficulty: "beginner",
    targetMuscles: ["Forearms"],
    instructions: [
      "Rest forearms on bench with hands over edge",
      "Hold barbell with underhand grip",
      "Curl wrists upward",
      "Lower slowly",
      "Keep forearms stationary"
    ]
  },
  {
    id: "49",
    name: "Reverse Curls",
    description: "Targets brachialis and forearm muscles.",
    videoUrl: "https://www.youtube.com/embed/nRgxYX2Ve9w",
    difficulty: "beginner",
    targetMuscles: ["Forearms", "Biceps"],
    instructions: [
      "Hold barbell with overhand grip",
      "Curl bar toward shoulders",
      "Keep wrists straight",
      "Lower with control",
      "Maintain grip throughout"
    ]
  },

  // MORE CORE EXERCISES
  {
    id: "50",
    name: "Cable Crunches",
    description: "Weighted ab exercise using cable machine.",
    videoUrl: "https://www.youtube.com/embed/Xyd_fa5zoEU",
    difficulty: "intermediate",
    targetMuscles: ["Abs", "Core"],
    instructions: [
      "Kneel facing high cable pulley",
      "Hold rope attachment at head",
      "Crunch down toward knees",
      "Contract abs forcefully",
      "Return to start with control"
    ]
  },
  {
    id: "51",
    name: "Bicycle Crunches",
    description: "Dynamic ab exercise targeting obliques.",
    videoUrl: "https://www.youtube.com/embed/Iwyvozckjak",
    difficulty: "beginner",
    targetMuscles: ["Abs", "Obliques"],
    instructions: [
      "Lie on back with hands behind head",
      "Bring opposite elbow to knee",
      "Alternate sides in cycling motion",
      "Keep lower back pressed down",
      "Maintain steady rhythm"
    ]
  },
  {
    id: "52",
    name: "Side Planks",
    description: "Isometric exercise for obliques and core stability.",
    videoUrl: "https://www.youtube.com/embed/K2VljzCC4bs",
    difficulty: "beginner",
    targetMuscles: ["Obliques", "Core"],
    instructions: [
      "Lie on side with forearm on ground",
      "Lift hips off ground",
      "Form straight line from head to feet",
      "Hold position",
      "Switch sides"
    ]
  },
  {
    id: "53",
    name: "Ab Wheel Rollouts",
    description: "Advanced core exercise for total abdominal strength.",
    videoUrl: "https://www.youtube.com/embed/EKTJpQ7Xr-c",
    difficulty: "advanced",
    targetMuscles: ["Abs", "Core", "Lower Back"],
    instructions: [
      "Kneel holding ab wheel",
      "Roll forward extending body",
      "Go as far as possible maintaining form",
      "Pull back to start using abs",
      "Keep core braced throughout"
    ]
  },
  {
    id: "54",
    name: "Dead Bug",
    description: "Core stability exercise with alternating limb movement.",
    videoUrl: "https://www.youtube.com/embed/g_BYB0R-4Ws",
    difficulty: "beginner",
    targetMuscles: ["Core", "Abs"],
    instructions: [
      "Lie on back with arms and legs up",
      "Lower opposite arm and leg simultaneously",
      "Return to start position",
      "Alternate sides",
      "Keep lower back pressed to floor"
    ]
  },

  // MORE GLUTE EXERCISES
  {
    id: "55",
    name: "Cable Pull-Throughs",
    description: "Hip hinge exercise targeting glutes and hamstrings.",
    videoUrl: "https://www.youtube.com/embed/1hW2BS7oLZU",
    difficulty: "beginner",
    targetMuscles: ["Glutes", "Hamstrings"],
    instructions: [
      "Face away from low cable pulley",
      "Hold rope between legs",
      "Hinge at hips and lean forward",
      "Thrust hips forward to stand",
      "Squeeze glutes at top"
    ]
  },
  {
    id: "56",
    name: "Glute Bridges",
    description: "Bodyweight or weighted glute activation exercise.",
    videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
    difficulty: "beginner",
    targetMuscles: ["Glutes", "Hamstrings"],
    instructions: [
      "Lie on back with knees bent",
      "Drive through heels lifting hips",
      "Squeeze glutes at top",
      "Lower hips back down",
      "Can add weight across hips"
    ]
  },
  {
    id: "57",
    name: "Step-Ups",
    description: "Unilateral leg exercise for glutes and quads.",
    videoUrl: "https://www.youtube.com/embed/dQqApCGd5Ss",
    difficulty: "beginner",
    targetMuscles: ["Glutes", "Quads"],
    instructions: [
      "Stand facing a box or bench",
      "Step up with one foot",
      "Drive through heel to stand on box",
      "Step back down with control",
      "Alternate legs or complete set per side"
    ]
  },
  {
    id: "58",
    name: "Sumo Squats",
    description: "Wide-stance squat emphasizing inner thighs and glutes.",
    videoUrl: "https://www.youtube.com/embed/HbA3EboEYO8",
    difficulty: "beginner",
    targetMuscles: ["Glutes", "Quads", "Adductors"],
    instructions: [
      "Stand with wide stance, toes out",
      "Hold weight at chest or arms length",
      "Squat down keeping knees out",
      "Drive through heels to stand",
      "Keep torso upright"
    ]
  },

  // OLYMPIC LIFTS & COMPOUND MOVEMENTS
  {
    id: "59",
    name: "Clean and Press",
    description: "Full-body explosive movement combining clean and overhead press.",
    videoUrl: "https://www.youtube.com/embed/KwYJTpQ_x5A",
    difficulty: "advanced",
    targetMuscles: ["Full Body", "Shoulders", "Legs"],
    instructions: [
      "Deadlift bar to hips",
      "Explosively pull bar to shoulders",
      "Catch in front rack position",
      "Press overhead to lockout",
      "Lower with control"
    ]
  },
  {
    id: "60",
    name: "Thrusters",
    description: "Combines front squat and overhead press for conditioning.",
    videoUrl: "https://www.youtube.com/embed/L219ltL15zk",
    difficulty: "intermediate",
    targetMuscles: ["Full Body", "Legs", "Shoulders"],
    instructions: [
      "Hold barbell at shoulders",
      "Squat down fully",
      "Explode up and press overhead",
      "Lock out arms at top",
      "Lower bar back to shoulders"
    ]
  },
  {
    id: "61",
    name: "Kettlebell Swings",
    description: "Dynamic hip hinge for power and conditioning.",
    videoUrl: "https://www.youtube.com/embed/YSxHifyI6s8",
    difficulty: "intermediate",
    targetMuscles: ["Glutes", "Hamstrings", "Core"],
    instructions: [
      "Stand with kettlebell between feet",
      "Hinge at hips and swing bell back",
      "Explosively thrust hips forward",
      "Swing kettlebell to shoulder height",
      "Let momentum carry movement"
    ]
  },
  {
    id: "62",
    name: "Turkish Get-Up",
    description: "Complex full-body movement for stability and strength.",
    videoUrl: "https://www.youtube.com/embed/x9FLXs8QZPE",
    difficulty: "advanced",
    targetMuscles: ["Full Body", "Core", "Shoulders"],
    instructions: [
      "Lie on back holding weight overhead",
      "Follow sequence to stand up",
      "Keep weight overhead throughout",
      "Reverse sequence back to ground",
      "Maintain control at all times"
    ]
  }
  ,
  // ADVANCED CALISTHENICS & GYMNASTICS
  {
    id: "63",
    name: "Handstand Push-Ups",
    description: "Vertical pressing strength move requiring shoulder stability and balance.",
    videoUrl: "https://www.youtube.com/embed/0MaQGNRxF3Y",
    difficulty: "advanced",
    targetMuscles: ["Shoulders", "Triceps", "Core"],
    instructions: [
      "Kick up to a stable wall-supported handstand",
      "Keep core braced and legs together",
      "Lower head toward floor with control",
      "Press back to full lockout through shoulders",
      "Maintain minimal arch and steady breathing"
    ]
  },
  {
    id: "64",
    name: "Pistol Squats",
    description: "Single-leg squat that builds balance, mobility, and leg strength.",
    videoUrl: "https://www.youtube.com/embed/1-c1yYyDV6w",
    difficulty: "advanced",
    targetMuscles: ["Quads", "Glutes", "Hamstrings", "Core"],
    instructions: [
      "Stand on one leg with other leg extended forward",
      "Reach arms forward for balance",
      "Sit hips down keeping heel on the ground",
      "Descend as low as control allows",
      "Drive through heel to stand tall"
    ]
  },
  {
    id: "65",
    name: "Nordic Hamstring Curls",
    description: "Eccentric hamstring exercise proven to reduce injury risk.",
    videoUrl: "https://www.youtube.com/embed/0aFyDwZqQ9A",
    difficulty: "advanced",
    targetMuscles: ["Hamstrings", "Glutes"],
    instructions: [
      "Kneel with ankles secured under a stable anchor",
      "Keep hips extended and core tight",
      "Slowly lower torso forward resisting with hamstrings",
      "Catch yourself with hands at the bottom",
      "Push lightly off floor to return and repeat"
    ]
  },
  {
    id: "66",
    name: "Dragon Flags",
    description: "Advanced core movement popularized by Bruce Lee for full-body tension.",
    videoUrl: "https://www.youtube.com/embed/yQpVCPNglj4",
    difficulty: "advanced",
    targetMuscles: ["Core", "Abs", "Hip Flexors", "Lats"],
    instructions: [
      "Hold a bench overhead for support",
      "Raise body straight as a plank on shoulders",
      "Lower body in one piece without bending hips",
      "Stop before losing tension or arch",
      "Pull back up maintaining straight line"
    ]
  },
  {
    id: "67",
    name: "L-Sit Holds",
    description: "Static hold that builds core, hip flexor, and shoulder strength.",
    videoUrl: "https://www.youtube.com/embed/wlQ6v7uGkFQ",
    difficulty: "advanced",
    targetMuscles: ["Core", "Hip Flexors", "Shoulders", "Triceps"],
    instructions: [
      "Support yourself on parallettes or dip bars",
      "Lock elbows and depress shoulders",
      "Lift both legs straight out to form an L",
      "Keep knees locked and toes pointed",
      "Hold while breathing shallow and steady"
    ]
  },
  {
    id: "68",
    name: "Front Lever Holds",
    description: "Gymnastic static hold demanding lat and core strength.",
    videoUrl: "https://www.youtube.com/embed/1zGSds_0wA4",
    difficulty: "advanced",
    targetMuscles: ["Lats", "Core", "Shoulders", "Biceps"],
    instructions: [
      "Hang from bar with false or normal grip",
      "Set shoulders down and back",
      "Raise body to horizontal as one rigid line",
      "Hold without hip pike or arch",
      "Lower with control when form breaks"
    ]
  },
  {
    id: "69",
    name: "Back Lever Holds",
    description: "Static hold emphasizing shoulder extension and core tension.",
    videoUrl: "https://www.youtube.com/embed/9iU5vN_Zd6A",
    difficulty: "advanced",
    targetMuscles: ["Shoulders", "Lats", "Core", "Biceps"],
    instructions: [
      "Use rings or bar with false grip",
      "Tuck then extend to horizontal face-down position",
      "Keep body straight and hips level",
      "Squeeze glutes to protect lower back",
      "Exit safely by tucking back up"
    ]
  },
  {
    id: "70",
    name: "Planche Leans",
    description: "Progression toward planche strength focusing on protraction.",
    videoUrl: "https://www.youtube.com/embed/6llczn_7X_k",
    difficulty: "advanced",
    targetMuscles: ["Shoulders", "Chest", "Triceps", "Core"],
    instructions: [
      "Start in top of push-up on floor or parallettes",
      "Protract shoulders and lock elbows",
      "Lean shoulders forward over hands",
      "Hold without sagging hips",
      "Increase lean gradually while keeping control"
    ]
  },
  {
    id: "71",
    name: "Copenhagen Planks",
    description: "Side plank variation that targets adductors and obliques.",
    videoUrl: "https://www.youtube.com/embed/uvvKX9n0XfI",
    difficulty: "advanced",
    targetMuscles: ["Adductors", "Obliques", "Core"],
    instructions: [
      "Set top leg on bench while side planking",
      "Lift hips to form straight line",
      "Squeeze inner thigh of top leg",
      "Keep bottom leg hovering or lightly supported",
      "Hold for time then switch sides"
    ]
  },
  {
    id: "72",
    name: "Hollow Body Holds",
    description: "Gymnastic core staple teaching posterior pelvic tilt and bracing.",
    videoUrl: "https://www.youtube.com/embed/HzmnOV5q5u8",
    difficulty: "beginner",
    targetMuscles: ["Core", "Abs", "Hip Flexors"],
    instructions: [
      "Lie on back and press lower spine into floor",
      "Lift shoulders and legs off ground",
      "Reach arms overhead while maintaining hollow shape",
      "Keep ribs down and glutes tight",
      "Hold without losing low-back contact"
    ]
  },

  // CARRIES & STRONGMAN-STYLE CONDITIONING
  {
    id: "73",
    name: "Farmer's Carries",
    description: "Loaded carry that builds grip, traps, and total-body stability.",
    videoUrl: "https://www.youtube.com/embed/q7rCeOa6jP8",
    difficulty: "beginner",
    targetMuscles: ["Forearms", "Traps", "Core", "Glutes"],
    instructions: [
      "Pick up heavy dumbbells or farmer handles",
      "Stand tall with shoulders packed",
      "Walk with short controlled steps",
      "Keep ribs down and avoid leaning",
      "Set weights down safely at finish"
    ]
  },
  {
    id: "74",
    name: "Suitcase Carries",
    description: "Single-sided carry to challenge lateral core stability and grip.",
    videoUrl: "https://www.youtube.com/embed/CO_wyQ9_5Cc",
    difficulty: "beginner",
    targetMuscles: ["Forearms", "Obliques", "Core", "Traps"],
    instructions: [
      "Hold one heavy weight at your side",
      "Stand tall without side bending",
      "Walk maintaining level shoulders",
      "Keep slow deliberate steps",
      "Switch sides after set distance or time"
    ]
  },
  {
    id: "75",
    name: "Sled Pushes",
    description: "Low-impact conditioning and leg power exercise using a prowler sled.",
    videoUrl: "https://www.youtube.com/embed/uE3rZQ6pBpc",
    difficulty: "beginner",
    targetMuscles: ["Legs", "Glutes", "Calves", "Core"],
    instructions: [
      "Set hands on sled handles",
      "Lean forward with straight arms",
      "Drive through legs taking powerful steps",
      "Maintain steady pace without bouncing",
      "Control stop by easing tension"
    ]
  },
  {
    id: "76",
    name: "Battle Rope Slams",
    description: "High-intensity conditioning move that taxes shoulders and core.",
    videoUrl: "https://www.youtube.com/embed/eB5V8SvvbZs",
    difficulty: "beginner",
    targetMuscles: ["Shoulders", "Forearms", "Core", "Cardio"],
    instructions: [
      "Anchor ropes and hold one end in each hand",
      "Adopt athletic stance with soft knees",
      "Raise ropes overhead then slam forcefully",
      "Reset quickly and repeat rhythmically",
      "Keep core braced to resist sway"
    ]
  },
  {
    id: "77",
    name: "Jump Rope",
    description: "Classic conditioning tool for timing, footwork, and cardio.",
    videoUrl: "https://www.youtube.com/embed/M4UeYVdC2ng",
    difficulty: "beginner",
    targetMuscles: ["Calves", "Cardio", "Shoulders", "Forearms"],
    instructions: [
      "Hold rope handles at hips",
      "Keep elbows close and wrists loose",
      "Jump lightly on balls of feet",
      "Turn rope with small wrist circles",
      "Maintain steady cadence and posture"
    ]
  },
  {
    id: "78",
    name: "Rowing Machine",
    description: "Full-body ergometer exercise for power and endurance.",
    videoUrl: "https://www.youtube.com/embed/eqVmMd7FdAA",
    difficulty: "beginner",
    targetMuscles: ["Legs", "Back", "Cardio", "Core"],
    instructions: [
      "Drive legs first keeping arms straight",
      "Open hips then finish with arm pull",
      "Reverse order on the recovery",
      "Keep stroke smooth at consistent pace",
      "Monitor split for pacing goals"
    ]
  },
  {
    id: "79",
    name: "Air Bike (Assault Bike)",
    description: "Fan bike that scales effort instantly for conditioning intervals.",
    videoUrl: "https://www.youtube.com/embed/ClvXgKp9Ewk",
    difficulty: "beginner",
    targetMuscles: ["Cardio", "Legs", "Shoulders", "Arms"],
    instructions: [
      "Sit tall with slight forward lean",
      "Drive pedals and handles together",
      "Maintain even push-pull rhythm",
      "Control breathing during intervals",
      "Ease off gradually to cool down"
    ]
  },
  {
    id: "80",
    name: "Landmine Press",
    description: "Angled pressing variation that is shoulder-friendly and core-intensive.",
    videoUrl: "https://www.youtube.com/embed/cI6KjRUcYMQ",
    difficulty: "beginner",
    targetMuscles: ["Shoulders", "Chest", "Core", "Triceps"],
    instructions: [
      "Secure barbell in landmine or corner",
      "Hold end of bar at chest with both or one hand",
      "Press bar up and slightly forward",
      "Avoid flaring ribs by bracing core",
      "Lower under control to start position"
    ]
  }
];


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const difficulty = searchParams.get("difficulty")?.toLowerCase() || "";

    const normalize = (str: string) => str.toLowerCase().replace(/[\s-]/g, "");
    const normalizedSearch = normalize(search);
    const singularSearch = search.endsWith("s") ? search.slice(0, -1) : search;
    const normalizedSingular = normalize(singularSearch);

    let filteredExercises = [...EXERCISES];

    // Filter by search term (name, description, or muscle)
    if (search) {
      filteredExercises = filteredExercises.filter((exercise) => {
        const name = exercise.name.toLowerCase();
        const description = exercise.description.toLowerCase();
        const muscles = exercise.targetMuscles.map((m) => m.toLowerCase());

        const normName = normalize(name);
        const normDescription = normalize(description);
        const normMuscles = muscles.map(normalize);

        const matchesName =
          name.includes(search) ||
          name.includes(singularSearch) ||
          normName.includes(normalizedSearch) ||
          normName.includes(normalizedSingular);

        const matchesDescription =
          description.includes(search) || normDescription.includes(normalizedSearch);

        const matchesMuscle = normMuscles.some((muscle, idx) => {
          const raw = muscles[idx];
          return (
            raw.includes(search) ||
            raw.includes(singularSearch) ||
            muscle.includes(normalizedSearch) ||
            muscle.includes(normalizedSingular)
          );
        });

        return matchesName || matchesDescription || matchesMuscle;
      });
    }

    // Filter by difficulty
    if (difficulty) {
      filteredExercises = filteredExercises.filter(
        (exercise) => exercise.difficulty === difficulty
      );
    }

    return NextResponse.json({
      exercises: filteredExercises,
      total: filteredExercises.length
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}
