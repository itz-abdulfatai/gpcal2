import {
  ScrollView,
  StyleSheet,
  View,
  LayoutAnimation,
  TouchableOpacity,
  Platform,
  UIManager,
} from "react-native";
import React, { useMemo, useState } from "react";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/typo";
import { useTheme } from "@/contexts/ThemeContext";
import { radius, spacingX, spacingY } from "@/constants/theme";
import Header from "@/components/header";
import BackButton from "@/components/BackButton";
import { SealCheckIcon } from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { Image } from "expo-image";
import { Link } from "expo-router";

  const skillCategories = [
    {
      title: "UI/UX & Frontend Development",

      highSkills: ["Next.js", "Flutter", "WordPress (Elementor)"],
      skills: [
        "UI Design",
        "React.js",
        "Next.js",
        "Tailwind CSS",
        "Flutter",
        "React Native",
        "WordPress (Elementor)",
        "WooCommerce",
        "Tutor LMS",
      ],
    },
    {
      title: "Backend & Database Technologies",
      highSkills: ["MERN Stack", "Node.js", "CI/CD", "Microservices", "AWS"],
      skills: [
        "MERN Stack",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Firebase",
        "Supabase",
        "CI/CD",
        "Docker",
        "PHP",
        "PostgreSQL",
        "AWS",
        "Microservices",
      ],
    },
    {
      title: "Digital Marketing & Automation",
      highSkills: [
        "Facebook & Instagram Ads",
        "Go High Level",
        "Google Analytics",
        "N8n",
      ],
      skills: [
        "Klaviyo",
        "Facebook & Instagram Ads",
        "Go High Level",
        "Google Analytics",
        "Email Marketing",
        "N8n",
        "Zapier",
        "HubSpot",
        "ActiveCampaign",
        "Mailchimp",
        "Make.com",
      ],
    },
  ];

  const AboutModal = () => {
    const { colors } = useTheme();
    React.useEffect(() => {
      if (
        Platform.OS === "android" &&
        UIManager.setLayoutAnimationEnabledExperimental
      ) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }, []);

    const [expanded, setExpanded] = useState(false);
    const styles = useMemo(
      () =>
        StyleSheet.create({
          skillCategory: {
            gap: spacingY._10,
            marginTop: spacingY._10,
          },
          skillItem: {
            borderRadius: radius._20,
            paddingHorizontal: spacingX._12,
            paddingVertical: spacingY._10,
          },
          skillsContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: verticalScale(8),
          },
          container: {
            flex: 1,
            paddingHorizontal: spacingX._20,
            paddingTop: spacingY._10,
            paddingBottom: spacingY._20,
            gap: spacingY._20,
          },
          sectionContainer: {
            padding: spacingX._10,
            gap: spacingX._20,
            borderWidth: 1,
            borderColor: colors.secondary,
            borderRadius: radius._10,
          },
          headings: {
            fontSize: 20,
            fontWeight: "bold",
          },
          row: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacingX._10,
          },
          avatar: {
            alignSelf: "center",
            backgroundColor: colors.secondary,
            height: verticalScale(90),
            width: verticalScale(90),
            borderRadius: 200,
            borderWidth: 1,
            borderColor: colors.secondary2,
            // overflow: "hidden",
            // position: "relative",
          },
        }),
      [colors]
    );

    const toggleExpanded = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded((prev) => !prev);
    };

    return (
      <ModalWrapper>
        <View style={{ paddingHorizontal: spacingX._20 }}>
          <Header title={"About this App"} leftIcon={<BackButton />} />
        </View>

        <ScrollView>
          <View style={styles.container}>
            <View style={styles.sectionContainer}>
              <Typo>
                Meet GPcal, your personal academic coach built to help you take
                full control of your grades and goals. It helps you understand
                how each course, grade, and effort impacts your GPA and CGPA,
                then shows you what to improve to hit your targets. With
                AI-driven predictions and smart visuals, GPcal turns raw grades
                into clear insights that help you plan smarter and perform
                better.
              </Typo>
              <Typo>
                But GPcal goes beyond numbers. It motivates, guides, and adapts
                to you — offering personalized study tips, progress tracking,
                and encouragement that keep you focused. Designed to help you
                score higher than you thought possible, GPcal exists for one
                reason: to make sure you reach your academic best.
              </Typo>

              <View>
                <View style={styles.row}>
                  <SealCheckIcon
                    color={colors.primary}
                    weight="duotone"
                    duotoneColor={colors.secondary}
                  />
                  <Typo>Smart GPA & CGPA Calculator</Typo>
                </View>
                <View style={styles.row}>
                  <SealCheckIcon
                    color={colors.primary}
                    weight="duotone"
                    duotoneColor={colors.secondary}
                  />
                  <Typo>Clear Visualisations</Typo>
                </View>
                <View style={styles.row}>
                  <SealCheckIcon
                    color={colors.primary}
                    weight="duotone"
                    duotoneColor={colors.secondary}
                  />
                  <Typo>AI-Powered Insights</Typo>
                </View>
                <View style={styles.row}>
                  <SealCheckIcon
                    color={colors.primary}
                    weight="duotone"
                    duotoneColor={colors.secondary}
                  />
                  <Typo>Custom Study Tips</Typo>
                </View>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Typo style={styles.headings}>About the Creator</Typo>
              <View style={[styles.row]}>
                <Image
                  source={require("../../assets/images/myAvatar.jpg")}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={100}
                />
                <View>
                  <Typo style={styles.headings}>Abdulfatai Aliyu</Typo>
                  <Typo
                    style={{
                      wordWrap: "break-word",
                    }}
                    color={colors.neutral2}
                  >
                    Full-stack Developer & Digital Marketer
                  </Typo>
                </View>
              </View>

              <Typo>
                Abdulfatai is a versatile professional adept at crafting
                seamless digital experiences. With a strong foundation in both
                front-end and back-end web and app development, complemented by
                a keen understanding of digital marketing strategies, he
                delivers comprehensive and impactful solutions that drive
                business growth and user engagement.
              </Typo>

              <View>
                <Typo style={{ fontSize: 18, fontWeight: "bold" }}>
                  Key Skills
                </Typo>

                {(expanded ? skillCategories : [skillCategories[0]]).map(
                  (category, index) => (
                    <View key={index} style={styles.skillCategory}>
                      <Typo size={18}>{category.title}</Typo>
                      <View style={styles.skillsContainer}>
                        {category.skills.map((skill, i) => (
                          <View
                            key={i}
                            style={[
                              styles.skillItem,
                              {
                                backgroundColor: category.highSkills.includes(
                                  skill
                                )
                                  ? colors.primary
                                  : colors.secondary,
                              },
                            ]}
                          >
                            <Typo
                              size={16}
                              color={
                                category.highSkills.includes(skill)
                                  ? colors.secondary
                                  : colors.primary
                              }
                            >
                              {skill}
                            </Typo>
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                )}
                <TouchableOpacity
                  onPress={toggleExpanded}
                  style={[
                    styles.skillItem,
                    {
                      backgroundColor: colors.secondary,
                      alignSelf: "flex-end",
                      marginTop: spacingY._10,
                    },
                  ]}
                >
                  <Typo color={colors.primary}>
                    {expanded ? "See Less" : "See More"}
                  </Typo>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Typo style={styles.headings}>Privacy Policy</Typo>
              <Typo>
                GPcal respects your privacy and keeps your data safe. All
                information you provide, such as your name, image, courses, and
                grades stays securely within the app and is never shared, sold,
                or used for anything outside its intended purpose. Simply put,
                your academic data belongs to you and always stays private.
              </Typo>
            </View>

            <View style={styles.sectionContainer}>
              <Typo>Version 1.0.0</Typo>
              {/* <Typo>Last Updated: January 1, 2023</Typo> */}
              <Link
                href="https://google.com"
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  textDecorationLine: "underline",
                }}
              >
                Check for updates
              </Link>
            </View>
          </View>
        </ScrollView>
      </ModalWrapper>
    );
  };

export default AboutModal;
