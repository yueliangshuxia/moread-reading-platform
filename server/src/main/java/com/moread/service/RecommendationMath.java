package com.moread.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * 推荐排序的纯算法部分：TOPSIS 与 MMR。
 * 与数据库解耦，方便单元测试，也方便论文里单独描述公式。
 */
public final class RecommendationMath {

    private RecommendationMath() {
    }

    /**
     * TOPSIS 贴近度。所有指标都按“越大越好”处理。
     *
     * @param raw     候选 × 指标矩阵
     * @param weights 指标权重，长度与列数一致
     * @return 每个候选的贴近度 C_i，范围 [0,1]
     */
    public static double[] topsis(double[][] raw, double[] weights) {
        int n = raw.length;
        if (n == 0) return new double[0];
        int m = weights.length;
        double[] safeWeights = normalizeWeights(weights, m);

        double[][] normalized = new double[n][m];
        for (int j = 0; j < m; j++) {
            double sum = 0.0;
            for (int i = 0; i < n; i++) sum += raw[i][j] * raw[i][j];
            double norm = Math.sqrt(sum);
            for (int i = 0; i < n; i++) {
                normalized[i][j] = norm == 0.0 ? 0.0 : raw[i][j] / norm;
            }
        }

        double[][] weighted = new double[n][m];
        double[] best = new double[m];
        double[] worst = new double[m];
        Arrays.fill(best, Double.NEGATIVE_INFINITY);
        Arrays.fill(worst, Double.POSITIVE_INFINITY);
        for (int j = 0; j < m; j++) {
            for (int i = 0; i < n; i++) {
                weighted[i][j] = normalized[i][j] * safeWeights[j];
                best[j] = Math.max(best[j], weighted[i][j]);
                worst[j] = Math.min(worst[j], weighted[i][j]);
            }
        }

        double[] result = new double[n];
        for (int i = 0; i < n; i++) {
            double plus = 0.0;
            double minus = 0.0;
            for (int j = 0; j < m; j++) {
                plus += Math.pow(weighted[i][j] - best[j], 2);
                minus += Math.pow(weighted[i][j] - worst[j], 2);
            }
            plus = Math.sqrt(plus);
            minus = Math.sqrt(minus);
            result[i] = (plus + minus) == 0.0 ? 0.0 : minus / (plus + minus);
        }
        return result;
    }

    /** 按贴近度从高到低返回下标。 */
    public static List<Integer> rank(double[] closeness) {
        List<Integer> indexes = new ArrayList<>();
        for (int i = 0; i < closeness.length; i++) indexes.add(i);
        indexes.sort(Comparator.comparingDouble((Integer i) -> closeness[i]).reversed());
        return indexes;
    }

    /**
     * MMR 重排：在相关性与多样性之间取折中。
     *
     * @param relevance  每个候选的相关性（TOPSIS 贴近度）
     * @param similarity 候选两两相似度矩阵
     * @param count      需要返回的数量
     * @param lambda     相关性权重，越大多样性越弱
     */
    public static List<Integer> mmr(double[] relevance, double[][] similarity, int count, double lambda) {
        int n = relevance.length;
        List<Integer> selected = new ArrayList<>();
        boolean[] used = new boolean[n];
        int target = Math.min(count, n);
        while (selected.size() < target) {
            int bestIndex = -1;
            double bestScore = Double.NEGATIVE_INFINITY;
            for (int i = 0; i < n; i++) {
                if (used[i]) continue;
                double maxSim = 0.0;
                for (int j : selected) {
                    maxSim = Math.max(maxSim, similarity[i][j]);
                }
                double score = lambda * relevance[i] - (1.0 - lambda) * maxSim;
                if (score > bestScore) {
                    bestScore = score;
                    bestIndex = i;
                }
            }
            if (bestIndex < 0) break;
            used[bestIndex] = true;
            selected.add(bestIndex);
        }
        return selected;
    }

    /** 标签 Jaccard 相似度，0~1。 */
    public static double jaccard(Set<String> a, Set<String> b) {
        if (a == null || b == null || (a.isEmpty() && b.isEmpty())) return 0.0;
        int inter = 0;
        for (String x : a) if (b.contains(x)) inter++;
        int union = a.size() + b.size() - inter;
        return union == 0 ? 0.0 : (double) inter / union;
    }

    public static double[] normalizeWeights(double[] weights, int m) {
        double[] result = new double[m];
        double sum = 0.0;
        for (int i = 0; i < m && i < weights.length; i++) {
            result[i] = Math.max(0.0, weights[i]);
            sum += result[i];
        }
        if (sum <= 0.0) {
            Arrays.fill(result, 1.0 / m);
            return result;
        }
        for (int i = 0; i < m; i++) result[i] /= sum;
        return result;
    }
}
