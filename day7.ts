enum HandType {
    High,
    OnePair,
    TwoPair,
    Three,
    FullHouse,
    Four,
    Five,
}

type Hand = {
    typ: HandType,
    cards: number[]
    bid: number
}

const card_to_rank = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "T": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14,
}

const test_input = `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`

function findHandType(cards: number[]): HandType {
    const counts = {}
    for (const card of cards) {
        if (card in counts) {
            counts[card] += 1
        } else {
            counts[card] = 1
        }
    }
    const comb = Object.values(counts).sort((a, b) => b - a) // sort descending order
    if (comb[0] == 5) {
        return HandType.Five
    } else if (comb[0] == 4) {
        return HandType.Four
    } else if (comb[0] == 3 && comb[1] == 2) {
        return HandType.FullHouse
    } else if (comb[0] == 3) {
        return HandType.Three
    } else if (comb[0] == 2 && comb[1] == 2) {
        return HandType.TwoPair
    } else if (comb[0] == 2) {
        return HandType.OnePair
    } else if (comb[0] == 1) {
        return HandType.High
    }
}

function parseHands(text: string): HandType[] {

    return text.split("\n").map((line) => {
        const [cards, bid] = line.split(" ")
        
        const cards_rank: number[] = cards.split("").map((c) => card_to_rank[c])
        const hand = {
            cards: cards_rank,
            typ: findHandType(cards_rank),
            bid: parseInt(bid)
        }
        // console.log(hand)
        return hand
    })
}

const day_input = await Deno.readTextFile("input/day7.txt")
const hands = parseHands(day_input)
hands.sort((ha, hb) => {
    if (ha.typ != hb.typ) {
        return ha.typ - hb.typ
    } else {
        for (let i=0; i < 5;i++) {
            if (ha.cards[i] != hb.cards[i]) {
                return ha.cards[i] - hb.cards[i]
            }
        }
    }
    return 0;
})
console.log("Part 1", hands.map((hand, i) => hand.bid * (i + 1)).reduce((a, b) => a + b))
