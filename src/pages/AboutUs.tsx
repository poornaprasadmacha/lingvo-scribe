
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { motion } from "framer-motion";

const AboutUs = () => {
  const founders = [
    {
      name: "Gautham",
      role: "Co-Founder & CEO",
      avatar: "G",
      bio: "Gautham brings extensive experience in language technology and AI. With a passion for breaking down language barriers, he leads our strategic vision and product development.",
      social: {
        linkedin: "https://linkedin.com/in/gautham",
        twitter: "https://twitter.com/gautham",
        github: "https://github.com/gautham",
        email: "gautham@translo.com"
      }
    },
    {
      name: "Sudhanshu",
      role: "Co-Founder & CTO",
      avatar: "S",
      bio: "Sudhanshu is an expert in machine learning and natural language processing. He oversees our technical infrastructure and ensures our translation technology remains state-of-the-art.",
      social: {
        linkedin: "https://linkedin.com/in/sudhanshu",
        twitter: "https://twitter.com/sudhanshu",
        github: "https://github.com/sudhanshu",
        email: "sudhanshu@translo.com"
      }
    },
    {
      name: "Amarnath",
      role: "Co-Founder & COO",
      avatar: "A",
      bio: "Amarnath brings operational excellence and business development expertise. He ensures our translation services meet the highest standards while expanding our global reach.",
      social: {
        linkedin: "https://linkedin.com/in/amarnath",
        twitter: "https://twitter.com/amarnath",
        github: "https://github.com/amarnath",
        email: "amarnath@translo.com"
      }
    }
  ];

  return (
    <Layout>
      <div className="translator-container pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 translator-text">Our Story</h1>
          <p className="text-lg text-gray-700 mb-8">
            At Translo, we're on a mission to break down language barriers and connect people across the world. 
            Founded in 2023, our team of language enthusiasts and AI experts has built a platform that makes 
            translation accessible, accurate, and effortless.
          </p>
          <div className="flex justify-center">
            <div className="h-1 w-20 bg-translator rounded-full"></div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 translator-text">Meet Our Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <motion.div 
                key={founder.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="text-center pb-0">
                    <Avatar className="mx-auto h-24 w-24 mb-4">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${founder.name}&background=3b82f6&color=fff&size=128`} />
                      <AvatarFallback className="bg-translator text-white text-xl">{founder.avatar}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl font-semibold">{founder.name}</CardTitle>
                    <CardDescription className="text-translator">{founder.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-4">
                    <p className="text-gray-600 text-sm">{founder.bio}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center space-x-4 pt-2">
                    <a href={founder.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-translator transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href={founder.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-translator transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href={founder.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-translator transition-colors">
                      <Github className="h-5 w-5" />
                    </a>
                    <a href={`mailto:${founder.social.email}`} className="text-gray-500 hover:text-translator transition-colors">
                      <Mail className="h-5 w-5" />
                    </a>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto mt-24 text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-900 translator-text">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-12">
            We believe language should never be a barrier to communication, knowledge, or opportunity. 
            Our mission is to create technology that enables seamless translation across all media formats, 
            making information universally accessible regardless of language.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AboutUs;
