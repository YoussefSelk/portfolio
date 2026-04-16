import type { GithubProfile, GithubRepo } from "@/lib/types";

type GithubSnapshot = {
  profile: GithubProfile;
  topRepos: GithubRepo[];
};

const fallbackGithubSnapshot: GithubSnapshot = {
  profile: {
    login: "YoussefSelk",
    name: "Youssef Selk | Software Engineer",
    bio: "Software Engineering Student | Full-Stack Developer | Interested in Data Engineering & Secure Systems",
    html_url: "https://github.com/YoussefSelk",
    followers: 6,
    following: 10,
    public_repos: 12,
  },
  topRepos: [
    {
      id: 1,
      name: "Projet-Vie-Associative",
      description:
        "Student association management platform for clubs, events, subscriptions, and validation workflows.",
      html_url: "https://github.com/YoussefSelk/Projet-Vie-Associative",
      homepage: "https://www.upgradevieasso.eilco-ulco.fr/",
      stargazers_count: 1,
      forks_count: 0,
      language: "PHP",
      pushed_at: "2026-04-10T16:10:46Z",
    },
    {
      id: 2,
      name: "VibeCode-PlayBook",
      description:
        "Lean multi-agent Codex workflow for better context control and validation.",
      html_url: "https://github.com/YoussefSelk/VibeCode-PlayBook",
      homepage: "https://youssefselk.github.io/VibeCode-PlayBook/",
      stargazers_count: 3,
      forks_count: 0,
      language: "PowerShell",
      pushed_at: "2026-04-06T02:40:05Z",
    },
  ],
};

export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "youssef-portfolio",
    };

    const [profileRes, reposRes] = await Promise.all([
      fetch("https://api.github.com/users/YoussefSelk", {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(
        "https://api.github.com/users/YoussefSelk/repos?per_page=100&sort=updated",
        {
          headers,
          next: { revalidate: 3600 },
        },
      ),
    ]);

    if (!profileRes.ok || !reposRes.ok) {
      return fallbackGithubSnapshot;
    }

    const profileData = (await profileRes.json()) as GithubProfile;
    const reposData = (await reposRes.json()) as GithubRepo[];

    const topRepos = reposData
      .filter((repo) => !repo.name.toLowerCase().includes("youssefselk"))
      .sort((a, b) => {
        const scoreA = a.stargazers_count * 3 + a.forks_count;
        const scoreB = b.stargazers_count * 3 + b.forks_count;

        if (scoreA === scoreB) {
          return Date.parse(b.pushed_at) - Date.parse(a.pushed_at);
        }

        return scoreB - scoreA;
      })
      .slice(0, 4);

    return {
      profile: {
        login: profileData.login,
        name: profileData.name,
        bio: profileData.bio,
        html_url: profileData.html_url,
        followers: profileData.followers,
        following: profileData.following,
        public_repos: profileData.public_repos,
      },
      topRepos: topRepos.length > 0 ? topRepos : fallbackGithubSnapshot.topRepos,
    };
  } catch {
    return fallbackGithubSnapshot;
  }
}
