import path from 'node:path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

type RequestDetail = {
    firstVisitedAt: Date;
    lastVisitedAt: Date;
    userAgent?: string;
};

type Statistics = {
    visits: number;
    requests: {
        [ip: string]: RequestDetail;
    };
};

class StatisticService {
    private stats: Statistics;
    private readonly statsDir: string;
    private readonly statsFilePath: string;
    private saveQueue: Promise<void>;

    constructor(dir: string) {
        this.statsDir = dir;
        this.statsFilePath = path.resolve(dir, 'stats.json');
        this.saveQueue = Promise.resolve();

        // 确保统计目录存在
        if (!fs.existsSync(this.statsDir)) {
            fs.mkdirSync(this.statsDir, { recursive: true });
        }

        // 初始化统计文件（如果不存在）
        if (!fs.existsSync(this.statsFilePath)) {
            fs.writeFileSync(
                this.statsFilePath,
                JSON.stringify({ visits: 0, requests: {} } as Statistics, null, '\t'),
                'utf-8'
            );
        }

        // 读取并解析现有数据
        const statsRawString = fs.readFileSync(this.statsFilePath, 'utf-8');
        const rawStats = JSON.parse(statsRawString) as Partial<Statistics>;

        // 初始化统计数据并转换日期字段
        this.stats = {
            visits: rawStats.visits ?? 0,
            requests: {},
        };

        if (rawStats.requests) {
            for (const ip in rawStats.requests) {
                const rawDetail = rawStats.requests[ip];
                this.stats.requests[ip] = {
                    firstVisitedAt: new Date(rawDetail.firstVisitedAt),
                    lastVisitedAt: new Date(rawDetail.lastVisitedAt),
                    userAgent: rawDetail.userAgent,
                };
            }
        }
    }

    /**
     * 内部方法：将统计数据安全地持久化到文件（使用队列防止并发写入）
     */
    private async saveStats(): Promise<void> {
        // 将写入操作加入队列并返回等待句柄
        const savePromise = this.saveQueue
            .then(async () => {
                await writeFile(
                    this.statsFilePath,
                    JSON.stringify(
                        {
                            ...this.stats,
                            requests: Object.fromEntries(
                                Object.entries(this.stats.requests).map(([ip, detail]) => [
                                    ip,
                                    {
                                        ...detail,
                                        firstVisitedAt: detail.firstVisitedAt.toISOString(),
                                        lastVisitedAt: detail.lastVisitedAt.toISOString(),
                                    },
                                ])
                            ),
                        },
                        null,
                        '\t'
                    ),
                    'utf-8'
                );
            })
            .catch((err) => {
                throw err;
            });

        this.saveQueue = savePromise;
        await savePromise;
    }

    /**
     * 记录来自特定 IP 的访问
     * @param ip 访问者 IP 地址
     * @param userAgent 可选的用户代理信息
     */
    public async recordVisit(ip: string, userAgent?: string): Promise<void> {
        this.stats.visits += 1;
        const now = new Date();

        if (!this.stats.requests[ip]) {
            this.stats.requests[ip] = {
                firstVisitedAt: now,
                lastVisitedAt: now,
                userAgent,
            };
        } else {
            const detail = this.stats.requests[ip];
            detail.lastVisitedAt = now;
            detail.userAgent = userAgent;
        }

        await this.saveStats();
    }

    /**
     * 增加总访问量统计（不记录 IP 详情）
     * @param increment 增量值（默认为 1）
     */
    public async incrementVisits(increment: number = 1): Promise<void> {
        this.stats.visits += increment;
        await this.saveStats();
    }

    /**
     * 获取完整统计数据副本
     */
    public getStatistics(): Readonly<Statistics> {
        return {
            visits: this.stats.visits,
            requests: Object.fromEntries(
                Object.entries(this.stats.requests).map(([ip, detail]) => [ip, { ...detail }])
            ),
        };
    }

    /**
     * 重置所有统计数据
     */
    public async resetStatistics(): Promise<void> {
        this.stats.visits = 0;
        this.stats.requests = {};
        await this.saveStats();
    }

    /**
     * 更新统计字段（扩展方法，便于后续添加新统计字段）
     * @param update 包含要更新字段的局部对象
     */
    public async updateStatistics(update: Partial<Statistics>): Promise<void> {
        this.stats = {
            ...this.stats,
            ...update,
            requests: update.requests
                ? Object.fromEntries(
                      Object.entries(update.requests).map(([ip, detail]) => [
                          ip,
                          {
                              ...detail,
                              firstVisitedAt:
                                  detail.firstVisitedAt instanceof Date
                                      ? detail.firstVisitedAt
                                      : new Date(detail.firstVisitedAt),
                              lastVisitedAt:
                                  detail.lastVisitedAt instanceof Date
                                      ? detail.lastVisitedAt
                                      : new Date(detail.lastVisitedAt),
                          },
                      ])
                  )
                : this.stats.requests,
        };
        await this.saveStats();
    }
}

export { StatisticService };
export type { Statistics };
