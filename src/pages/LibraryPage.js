import React, { useState, useMemo } from 'react';
import './LibraryPage.css';
import { useNavigate } from 'react-router-dom';
import { BookOpenText, Video, Activity, Search, Filter } from 'lucide-react';

const sampleContent = [
  { id: '1', type: 'article', title: 'Understanding Anxiety', description: 'Learn about the common symptoms and causes of anxiety.', category: 'Anxiety', url: 'https://en.wikipedia.org/wiki/Anxiety' },
  { id: '1', type: 'exercise', title: 'Coping with Panic Attacks', description: 'Learn effective strategies for handling panic attacks.', category: 'Anxiety', content: 'https://www.helpguide.org/articles/anxiety/panic-attacks.htm' },
  { id: '3', type: 'video', title: 'Introduction to Mindfulness', description: 'Watch this video to understand the basics of mindfulness.', category: 'Mindfulness', url: 'https://www.youtube.com/watch?v=1vx8iUvfyCY' },
  { id: '4', type: 'article', title: 'Managing Work Stress', description: 'Tips and strategies for coping with stress at work.', category: 'Stress', url: 'https://www.glamour.com/story/work-stress-anxiety-relief-ti' },
  { id: '5', type: 'exercise', title: 'Progressive Muscle Relaxation', description: 'Relax your body and mind with this guided exercise.', category: 'Stress', content: 'https://www.youtube.com/watch?v=1nZEdqcGVzo' },
  { id: '6', type: 'video', title: 'Cognitive Restructuring Techniques', description: 'Learn how to challenge negative thought patterns.', category: 'CBT', url: 'https://www.youtube.com/watch?v=5cVZrSgR6gA' },
  { id: '7', type: 'article', title: 'Building Resilience', description: 'Strategies to bounce back from adversity.', category: 'Resilience', url: 'https://www.verywellmind.com/ways-to-become-more-resilient-2795063' },
  { id: '8', type: 'exercise', title: 'Mindful Walking', description: 'Practice mindfulness during your daily walk.', category: 'Mindfulness', content: 'https://www.youtube.com/watch?v=QdO1vZJgUu0' },
  { id: '9', type: 'article', title: 'The Science of Bouncing Back', description: 'Research on resilience and how it enables individuals to thrive during and after difficult times.', category: 'Resilience', url: 'https://time.com/3892044/the-science-of-bouncing-back/' },
  { id: '10', type: 'exercise', title: 'Walking Meditation', description: 'Discover the health benefits of walking meditation.', category: 'Mindfulness', content: 'https://www.verywellhealth.com/walking-meditation-8685709' },
  { id: '11', type: 'video', title: 'Overcoming Social Anxiety', description: 'Tips to help you feel more comfortable in social settings.', category: 'Anxiety', url: 'https://www.healthline.com/health/social-anxiety-disorder' },
  { id: '12', type: 'video', title: 'Mindful Eating Exercise', description: 'Practice being present while eating to enhance digestion and enjoyment.', category: 'Mindfulness', url: 'https://www.thefullhelping.com/how-to-practice-mindful-eating/' },
  { id: '13', type: 'exercise', title: 'Music Therapy for Stress', description: 'Discover how music can reduce stress and anxiety.', category: 'Stress', content: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3734071/' },
  { id: '14', type: 'article', title: 'Intro to CBT', description: 'How Cognitive Behavioral Therapy works and its benefits.', category: 'CBT', url: 'https://psychcentral.com/lib/in-depth-cognitive-behavioral-therapy' },
  { id: '15', type: 'article', title: 'Habits of Resilient People', description: 'Daily practices to build mental strength.', category: 'Resilience', url: 'https://www.inc.com/christina-desmarais/7-habits-of-highly-resilient-people.html' },
  { id: '16', type: 'exercise', title: '5-Minute Breathing Exercise', description: 'A quick guided breathing technique to calm your mind.', category: 'Mindfulness', content: 'https://www.youtube.com/watch?v=nmFUDkj1Aq0' },
  { id: '17', type: 'article', title: 'Daily Gratitude Practice', description: 'Reflect on positive aspects of your day.', category: 'Mindfulness', url: 'https://positivepsychology.com/gratitude-exercises/' },
  { id: '18', type: 'video', title: 'Time Management for Stress Relief', description: 'Learn how organizing your time reduces stress.', category: 'Stress', url: 'https://www.verywellmind.com/time-management-to-reduce-stress-3144729' },
  { id: '19', type: 'exercise', title: 'CBT for Depression', description: 'Using CBT techniques to manage depressive thoughts.', category: 'CBT', content: 'https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies/cognitive-behavioural-therapy-cbt/' },
  { id: '20', type: 'video', title: 'Finding Meaning in Adversity', description: 'Turn tough experiences into growth opportunities.', category: 'Resilience', url: 'https://www.psychologytoday.com/us/blog/the-clarity/202002/finding-meaning-in-adversity' },
  { id: '21', type: 'article', title: 'Understanding Generalized Anxiety Disorder (GAD)', description: 'Learn more about the symptoms, causes, and treatments of GAD.', category: 'Anxiety', url: 'https://www.nimh.nih.gov/health/topics/generalized-anxiety-disorder-gad' },
  { id: '22', type: 'exercise', title: 'Box Breathing Technique', description: 'A powerful breathing exercise to calm your nervous system.', category: 'Mindfulness', content: 'https://www.healthline.com/health/box-breathing' },
  { id: '23', type: 'video', title: 'Stress Relief Yoga', description: 'Simple yoga flow for reducing stress and anxiety.', category: 'Stress', url: 'https://www.youtube.com/watch?v=bJJWArRfKa0' },
  { id: '24', type: 'article', title: 'Understanding Cognitive Distortions', description: 'Identify and reframe negative thought patterns.', category: 'CBT', url: 'https://www.verywellmind.com/what-are-cognitive-distortions-2794767' },
  { id: '25', type: 'exercise', title: 'Journaling for Resilience', description: 'Write through your feelings to increase mental strength.', category: 'Resilience', content: 'https://www.psychologytoday.com/us/blog/words-matter/201902/how-journaling-builds-resilience' },
  { id: '26', type: 'video', title: 'Understanding Panic Attacks', description: 'Explore the causes and how to handle panic attacks.', category: 'Anxiety', url: 'https://www.youtube.com/watch?v=WUU9ZrXkY9M' },
  { id: '27', type: 'article', title: 'Mindfulness for Beginners', description: 'A practical guide to starting mindfulness practices.', category: 'Mindfulness', url: 'https://www.mindful.org/mindfulness-for-beginners-video/' },
  { id: '28', type: 'exercise', title: 'Guided Body Scan', description: 'A full-body mindfulness exercise for relaxation.', category: 'Mindfulness', content: 'https://www.uclahealth.org/programs/marc/mindful-meditations/body-scan' },
  { id: '29', type: 'video', title: 'Work-Life Balance Tips', description: 'Improve your work-life balance to reduce stress.', category: 'Stress', url: 'https://www.youtube.com/watch?v=yzj0D4XB-4I' },
  { id: '30', type: 'article', title: 'Behavioral Activation in CBT', description: 'How behavioral strategies help combat depression.', category: 'CBT', url: 'https://psychologytools.com/self-help/behavioral-activation/' },
  { id: '31', type: 'exercise', title: 'Visualization Exercise', description: 'Calm your mind with guided imagery.', category: 'Resilience', content: 'https://www.headspace.com/meditation/visualization' },
  { id: '32', type: 'article', title: 'How to Calm an Anxious Mind', description: 'Techniques to regain control in moments of anxiety.', category: 'Anxiety', url: 'https://www.psychologytoday.com/us/blog/finding-new-home/202106/5-ways-calm-your-anxious-mind' },
  { id: '33', type: 'video', title: '10-Minute Meditation', description: 'Follow this quick meditation session for mindfulness.', category: 'Mindfulness', url: 'https://www.youtube.com/watch?v=inpok4MKVLM' },
  { id: '34', type: 'exercise', title: 'Mindful Listening Exercise', description: 'Enhance awareness by listening without judgment.', category: 'Mindfulness', content: 'https://www.mindful.org/mindful-listening/' },
  { id: '35', type: 'article', title: 'The Effects of Chronic Stress', description: 'Understand how stress affects your health long-term.', category: 'Stress', url: 'https://www.apa.org/topics/stress/chronic' },
  { id: '36', type: 'exercise', title: 'CBT Thought Record Sheet', description: 'Track and challenge your unhelpful thoughts.', category: 'CBT', content: 'https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Depression' },
  { id: '37', type: 'video', title: 'Stories of Resilience', description: 'Inspiring real-life stories of people who overcame adversity.', category: 'Resilience', url: 'https://www.youtube.com/watch?v=Q_F1NQSi9xQ' },
  { id: '38', type: 'article', title: 'How to Identify an Anxiety Trigger', description: 'Recognizing the root causes of anxious responses.', category: 'Anxiety', url: 'https://www.verywellmind.com/common-anxiety-triggers-5207497' },
  { id: '39', type: 'exercise', title: 'Mindful Coloring', description: 'Use art to engage the senses and relax.', category: 'Mindfulness', content: 'https://www.therapistaid.com/therapy-worksheet/mindfulness-coloring' },
  { id: '40', type: 'video', title: 'Progressive Relaxation for Sleep', description: 'Help your body relax to fall asleep faster.', category: 'Stress', url: 'https://www.youtube.com/watch?v=ihO02wUzgkc' },
  { id: '41', type: 'article', title: 'Reframing Negative Thoughts', description: 'Use CBT to reshape your perspective.', category: 'CBT', url: 'https://www.therapistaid.com/worksheets/cognitive-restructuring-introduction.pdf' },
  { id: '42', type: 'exercise', title: 'Self-Compassion Practice', description: 'Treat yourself with kindness in difficult times.', category: 'Resilience', content: 'https://self-compassion.org/wp-content/uploads/2020/08/self-compassion.exercises.pdf' },
  { id: '43', type: 'video', title: 'Dealing with Anxiety in Teens', description: 'Support strategies for youth anxiety.', category: 'Anxiety', url: 'https://www.youtube.com/watch?v=jz_8tVME3W8' },
  { id: '44', type: 'article', title: 'Mindfulness at Work', description: 'Techniques to stay focused and calm in the office.', category: 'Mindfulness', url: 'https://hbr.org/2017/09/mindfulness-can-literally-change-your-brain' },
  { id: '45', type: 'exercise', title: 'Gratitude Journaling', description: 'Daily prompts to focus on the positive.', category: 'Mindfulness', content: 'https://greatergood.berkeley.edu/images/tools/gratitude_journal.pdf' },
  { id: '46', type: 'article', title: 'Signs of Burnout', description: 'Learn how to spot and recover from burnout.', category: 'Stress', url: 'https://www.helpguide.org/articles/stress/burnout-prevention-and-recovery.htm' },
  { id: '47', type: 'exercise', title: 'CBT for Self-Criticism', description: 'Techniques to overcome negative self-talk.', category: 'CBT', content: 'https://psychologytools.com/self-help/self-criticism/' },
  { id: '48', type: 'video', title: 'Post-Traumatic Growth', description: 'Discover how adversity can lead to positive change.', category: 'Resilience', url: 'https://www.youtube.com/watch?v=1FDyiUEn8V0' },
  { id: '49', type: 'article', title: 'Managing Anxiety in Relationships', description: 'Address anxiety without damaging connection.', category: 'Anxiety', url: 'https://www.verywellmind.com/how-to-handle-anxiety-in-relationships-5206986' },
  { id: '50', type: 'exercise', title: '5 Senses Grounding Technique', description: 'Bring yourself to the present moment with this sensory exercise.', category: 'Mindfulness', content: 'https://www.therapistaid.com/worksheets/grounding-techniques.pdf' },
  { id: '51', type: 'article', title: 'Understanding Panic Disorder', description: 'An overview of panic disorder symptoms and treatments.', category: 'Anxiety', url: 'https://www.nimh.nih.gov/health/topics/panic-disorder' },
  { id: '52', type: 'exercise', title: 'Mindful Breathing for Anxiety', description: 'A guided breathing exercise to manage anxiety.', category: 'Mindfulness', content: 'https://www.youtube.com/watch?v=SEfs5TJZ6Nk' },
  { id: '53', type: 'video', title: 'Stress Management Techniques', description: 'Learn effective techniques to manage stress.', category: 'Stress', url: 'https://www.youtube.com/watch?v=hnpQrMqDoqE' },
  { id: '54', type: 'article', title: 'Cognitive Behavioral Therapy Explained', description: 'An introduction to CBT and how it works.', category: 'CBT', url: 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral' },
  { id: '55', type: 'exercise', title: 'Resilience Building Activities', description: 'Activities designed to enhance personal resilience.', category: 'Resilience', content: 'https://www.mindtools.com/pages/article/resilience-building.htm' },
  { id: '56', type: 'video', title: 'Overcoming Social Anxiety', description: 'Strategies to cope with social anxiety.', category: 'Anxiety', url: 'https://www.youtube.com/watch?v=5oY1Qz0U1h4' },
  { id: '57', type: 'article', title: 'Mindfulness Meditation Benefits', description: 'Explore the benefits of mindfulness meditation.', category: 'Mindfulness', url: 'https://www.healthline.com/nutrition/mindfulness-meditation' },
  { id: '58', type: 'exercise', title: 'Guided Meditation for Stress Relief', description: 'A meditation session to alleviate stress.', category: 'Stress', content: 'https://www.youtube.com/watch?v=MIr3RsUWrdo' },
  { id: '59', type: 'video', title: 'CBT Techniques for Depression', description: 'Learn CBT techniques to manage depression.', category: 'CBT', url: 'https://www.youtube.com/watch?v=9c_Bv_FBE-c' },
  { id: '60', type: 'article', title: 'Developing Emotional Resilience', description: 'Tips for building emotional resilience.', category: 'Resilience', url: 'https://www.psychologytoday.com/us/basics/resilience' },
  { id: '61', type: 'exercise', title: 'Anxiety Journaling Prompts', description: 'Prompts to help manage anxiety through journaling.', category: 'Anxiety', content: 'https://www.therapistaid.com/worksheets/journal-prompts-for-anxiety.pdf' },
  { id: '62', type: 'article', title: 'Mindful Eating Practices', description: 'Learn how to eat mindfully for better health.', category: 'Mindfulness', url: 'https://www.mindful.org/mindful-eating/' },
  { id: '63', type: 'video', title: 'Stress Reduction Yoga Flow', description: 'A yoga session focused on reducing stress.', category: 'Stress', url: 'https://www.youtube.com/watch?v=4pLUleLdwY4' },
  { id: '64', type: 'exercise', title: 'CBT Thought Record Worksheet', description: 'A worksheet to challenge negative thoughts.', category: 'CBT', content: 'https://www.getselfhelp.co.uk/docs/ThoughtRecordSheet7.pdf' },
  { id: '65', type: 'article', title: 'Building Resilience in Children', description: 'Strategies to foster resilience in kids.', category: 'Resilience', url: 'https://www.apa.org/topics/resilience/children' },
  { id: '66', type: 'video', title: 'Managing Health Anxiety', description: 'Approaches to cope with health-related anxiety.', category: 'Anxiety', url: 'https://www.youtube.com/watch?v=1z3kz3Z0Z3k' },
  { id: '67', type: 'exercise', title: 'Mindfulness Body Scan', description: 'A guided body scan meditation.', category: 'Mindfulness', content: 'https://www.mindful.org/body-scan/' },
  { id: '68', type: 'article', title: 'The Impact of Chronic Stress', description: 'Understanding how chronic stress affects health.', category: 'Stress', url: 'https://www.apa.org/news/press/releases/stress/2014/stress-report' },
  { id: '69', type: 'exercise', title: 'CBT Behavioral Activation', description: 'Engage in activities to combat depression.', category: 'CBT', content: 'https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Depression' },
  { id: '70', type: 'video', title: 'Resilience in the Face of Adversity', description: 'Stories of overcoming challenges.', category: 'Resilience', url: 'https://www.youtube.com/watch?v=1FDyiUEn8V0' },
  { id: '71', type: 'article', title: 'Recognizing Anxiety Triggers', description: 'Identify and manage your anxiety triggers.', category: 'Anxiety', url: 'https://www.verywellmind.com/common-anxiety-triggers-5207497' },
  { id: '72', type: 'exercise', title: 'Mindful Walking Practice', description: 'Instructions for practicing mindful walking.', category: 'Mindfulness', content: 'https://www.mindful.org/daily-mindful-walking-practice/' },
  { id: '73', type: 'video', title: 'Stress Management Strategies', description: 'Techniques to manage and reduce stress.', category: 'Stress', url: 'https://www.youtube.com/watch?v=hnpQrMqDoqE' },
  { id: '74', type: 'article', title: 'Understanding CBT', description: 'An overview of Cognitive Behavioral Therapy.', category: 'CBT', url: 'https://www.nhs.uk/conditions/cognitive-behavioural-therapy-cbt/' },
  { id: '75', type: 'exercise', title: 'Resilience Reflection Journal', description: 'Journal prompts to build resilience.', category: 'Resilience', content: 'https://positivepsychology.com/resilience-worksheets/' },
  { id: '76', type: 'video', title: 'Managing Anxiety with Mindfulness', description: 'Use mindfulness to cope with anxiety.', category: 'Anxiety', url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8' },
  { id: '77', type: 'article', title: 'Mindfulness Techniques for Beginners', description: 'Simple mindfulness practices to start with.', category: 'Mindfulness', url: 'https://www.mindful.org/meditation/mindfulness-getting-started/' },
  { id: '78', type: 'exercise', title: 'Progressive Muscle Relaxation', description: 'A guide to relaxing your muscles progressively.', category: 'Stress', content: 'https://www.anxietycanada.com/articles/how-to-do-progressive-muscle-relaxation/' },
  { id: '79', type: 'video', title: 'CBT for Anxiety Disorders', description: 'How CBT helps in treating anxiety.', category: 'CBT', url: 'https://www.youtube.com/watch?v=1wZ7C7VvZ4I' },
  { id: '80', type: 'article', title: 'The Science of Resilience', description: 'Research on resilience and mental health.', category: 'Resilience', url: 'https://www.apa.org/monitor/2013/11/resilience' },
  { id: '81', type: 'exercise', title: 'Anxiety Coping Cards', description: 'Create cards with coping statements for anxiety.', category: 'Anxiety', content: 'https://www.therapistaid.com/worksheets/coping-skills-anxiety.pdf' },
  { id: '82', type: 'article', title: 'Mindful Communication', description: 'Enhance communication through mindfulness.', category: 'Mindfulness', url: 'https://www.mindful.org/mindful-communication/' },
  { id: '83', type: 'video', title: 'Stress Relief Meditation', description: 'A meditation session to relieve stress.', category: 'Stress', url: 'https://www.youtube.com/watch?v=MIr3RsUWrdo' },
  { id: '84', type: 'exercise', title: 'CBT for Negative Thinking', description: 'Challenge and change negative thoughts.', category: 'CBT', content: 'https://www.getselfhelp.co.uk/docs/NegativeThoughts.pdf' },
  { id: '85', type: 'article', title: 'Resilience in the Workplace', description: 'Building resilience in professional settings.', category: 'Resilience', url: 'https://hbr.org/2016/06/what-resilience-means-and-why-it-matters' },
  { id: '86', type: 'video', title: 'Understanding Anxiety Disorders', description: 'An overview of different anxiety disorders.', category: 'Anxiety', url: 'https://www.youtube.com/watch?v=1wZ7C7VvZ4I' },
  { id: '87', type: 'exercise', title: 'Mindfulness for Sleep', description: 'Practices to improve sleep through mindfulness.', category: 'Mindfulness', content: 'https://www.mindful.org/mindfulness-for-sleep/' },
  { id: '88', type: 'article', title: 'Stress and Its Impact on Health', description: 'How stress affects physical and mental health.', category: 'Stress', url: 'https://www.cdc.gov/mentalhealth/stress-coping/cope-with-stress/index.html' },
  { id: '89', type: 'exercise', title: 'CBT Self-Monitoring', description: 'Track thoughts and behaviors for CBT.', category: 'CBT', content: 'https://www.getselfhelp.com' },
  { id: '90', type: 'exercise', title: 'Emotion Regulation Skills', description: 'Practice skills to manage overwhelming emotions.', category: 'CBT', content: 'https://www.therapistaid.com/worksheets/emotion-regulation-skills.pdf' },
  { id: '91', type: 'video', title: 'Self-Care for Mental Health', description: 'Simple self-care habits for emotional well-being.', category: 'Resilience', url: 'https://www.youtube.com/watch?v=6rAs2fF8brU' },
  { id: '92', type: 'article', title: 'What is Emotional Resilience?', description: 'Explore what makes people emotionally strong and adaptable.', category: 'Resilience', url: 'https://www.apa.org/topics/resilience' },
  { id: '93', type: 'exercise', title: 'The STOP Mindfulness Tool', description: 'Use this simple tool to regain control in stressful moments.', category: 'Mindfulness', content: 'https://positivepsychology.com/stop-technique-mindfulness/' },
  { id: '94', type: 'video', title: 'How CBT Works', description: 'An introduction to how Cognitive Behavioral Therapy helps with mental health.', category: 'CBT', url: 'https://www.youtube.com/watch?v=9c_Bv_FBE-c' },
  { id: '95', type: 'article', title: 'Dealing with Burnout as a Student', description: 'Tips for managing academic stress and burnout.', category: 'Stress', url: 'https://psychcentral.com/stress/student-burnout' },
  { id: '96', type: 'exercise', title: 'Mood Tracking Journal', description: 'Track your mood to identify emotional patterns.', category: 'Mindfulness', content: 'https://www.therapistaid.com/worksheets/mood-journal.pdf' },
  { id: '97', type: 'article', title: 'How to Stay Grounded During Panic', description: 'Effective grounding strategies to manage panic attacks.', category: 'Anxiety', url: 'https://www.healthline.com/health/grounding-techniques' },
  { id: '98', type: 'video', title: 'Guided Meditation for Self-Love', description: 'Practice self-love and acceptance through meditation.', category: 'Mindfulness', url: 'https://www.youtube.com/watch?v=itZMM5gCboo' },
  { id: '99', type: 'exercise', title: 'Daily Affirmation Practice', description: 'Boost self-esteem with positive affirmations.', category: 'Resilience', content: 'https://positivepsychology.com/daily-affirmations/' },
  { id: '100', type: 'article', title: 'CBT vs. Mindfulness: What’s the Difference?', description: 'Compare two popular mental health approaches.', category: 'CBT', url: 'https://psychcentral.com/health/cbt-vs-mindfulness' },

];

const getIcon = (type) => {
  switch (type) {
    case 'article': return <BookOpenText size={20} />;
    case 'video': return <Video size={20} />;
    case 'exercise': return <Activity size={20} />;
    default: return null;
  }
};

const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const categories = useMemo(() => {
    return ['all', ...new Set(sampleContent.map(item => item.category))];
  }, []);

  const filteredContent = useMemo(() => {
    return sampleContent.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="library-container">
      <div className="library-card">
        <h1>Mental Wellness Library</h1>
        <p>Explore resources to support your well-being.</p>
        <div className="library-controls">
          <div className="search-box">
            <Search className="icon" />
            <input
              type="search"
              placeholder="Search articles, videos, exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filter">
            <Filter className="icon" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <button className="recommend-button" onClick={() => navigate('/Recommend')}>
            Go to Recommendations
          </button>
        </div>
      </div>

      {filteredContent.length > 0 ? (
        <div className="content-list">
          {filteredContent.map(item => (
            <div key={item.id} className="content-card">
              <div className="content-header">
                {getIcon(item.type)}
                <h2>{item.title}</h2>
              </div>
              <p>{item.description}</p>
              {item.type === 'video' || item.type === 'article' ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.type === 'video' ? 'Watch Video' : 'Read Article'}
                </a>
              ) : (
                <a href={item.content} target="_blank" rel="noopener noreferrer">Start Exercise</a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default LibraryPage;