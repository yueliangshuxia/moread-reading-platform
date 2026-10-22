package com.moread;

import com.moread.service.RecommendationMath;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RecommendationMathTest {

    @Test
    void topsisRanksStrongCandidateFirst() {
        double[][] raw = {
                {1.00, 0.10, 0.20, 0.30},
                {0.20, 0.90, 0.80, 0.70},
                {0.50, 0.50, 0.50, 0.50}
        };
        double[] weights = {0.35, 0.30, 0.20, 0.15};

        double[] closeness = RecommendationMath.topsis(raw, weights);

        assertEquals(3, closeness.length);
        assertTrue(closeness[1] > closeness[0], "协同/热度/新鲜度都高的候选应排前面");
        assertEquals(1, RecommendationMath.rank(closeness).get(0));
    }

    @Test
    void weightsAreNormalized() {
        double[] normalized = RecommendationMath.normalizeWeights(new double[]{40, 30, 20, 10}, 4);
        assertEquals(1.0, normalized[0] + normalized[1] + normalized[2] + normalized[3], 1e-9);
        assertEquals(0.4, normalized[0], 1e-9);
    }

    @Test
    void zeroWeightsFallBackToEqual() {
        double[] normalized = RecommendationMath.normalizeWeights(new double[]{0, 0, 0, 0}, 4);
        assertEquals(0.25, normalized[0], 1e-9);
    }

    @Test
    void mmrPrefersDiversity() {
        double[] relevance = {1.0, 0.9, 0.8};
        double[][] similarity = {
                {1.0, 0.99, 0.0},
                {0.99, 1.0, 0.0},
                {0.0, 0.0, 1.0}
        };
        List<Integer> selected = RecommendationMath.mmr(relevance, similarity, 2, 0.7);
        assertEquals(List.of(0, 2), selected, "第二个位置应选与第一个不相似的候选");
    }

    @Test
    void jaccardSimilarity() {
        assertEquals(1.0 / 3.0, RecommendationMath.jaccard(Set.of("a", "b"), Set.of("b", "c")), 1e-9);
        assertEquals(0.0, RecommendationMath.jaccard(Set.of(), Set.of("a")));
    }
}
